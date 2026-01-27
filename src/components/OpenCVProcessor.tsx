import React, { useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

declare const cv: any;

interface OpenCVProcessorProps {
    base64Image: string;
    onSuccess: (base64Result: string) => void;
    onError: (message: string) => void;
}

/**
 * Runs OpenCV.js inside a hidden WebView to auto-detect the document,
 * apply preprocessing (grayscale, blur, Canny, contour detection),
 * and returns a perspective-corrected, enhanced JPEG as base64.
 */
export const OpenCVProcessor = ({ base64Image, onSuccess, onError }: OpenCVProcessorProps) => {
    const html = useMemo(
        () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body, html { margin:0; padding:0; }
            canvas { display:none; }
          </style>
        </head>
        <body>
          <img id="imageSrc" src="data:image/jpeg;base64,${base64Image}" style="display:none;" />
          <canvas id="canvasOutput"></canvas>
          <script>
            const post = (type, payload) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
            };

            const orderPoints = (pts) => {
              // pts: array of {x,y} length 4
              const sum = pts.map(p => p.x + p.y);
              const diff = pts.map(p => p.x - p.y);
              const ordered = [];
              ordered[0] = pts[sum.indexOf(Math.min(...sum))]; // top-left
              ordered[2] = pts[sum.indexOf(Math.max(...sum))]; // bottom-right
              ordered[1] = pts[diff.indexOf(Math.min(...diff))]; // top-right
              ordered[3] = pts[diff.indexOf(Math.max(...diff))]; // bottom-left
              return ordered;
            };

            function process() {
              try {
                const srcImg = document.getElementById('imageSrc');
                const src = cv.imread(srcImg);
                const gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

                const blur = new cv.Mat();
                cv.GaussianBlur(gray, blur, new cv.Size(5,5), 0, 0, cv.BORDER_DEFAULT);

                // optional contrast stretch: alpha=1.25
                const contrast = new cv.Mat();
                blur.convertTo(contrast, -1, 1.25, 0);

                const edges = new cv.Mat();
                cv.Canny(contrast, edges, 75, 200);

                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();
                cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

                let maxArea = 0;
                let bestQuad = null;
                for (let i = 0; i < contours.size(); i++) {
                  const cnt = contours.get(i);
                  const peri = cv.arcLength(cnt, true);
                  const approx = new cv.Mat();
                  cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
                  if (approx.rows === 4) {
                    const area = cv.contourArea(approx);
                    if (area > maxArea) {
                      maxArea = area;
                      bestQuad = approx;
                    } else {
                      approx.delete();
                    }
                  } else {
                    approx.delete();
                  }
                  cnt.delete();
                }

                if (!bestQuad) {
                  throw new Error('Tidak menemukan kontur dokumen (4 titik).');
                }

                // Extract points
                const points = [];
                for (let r = 0; r < bestQuad.rows; r++) {
                  points.push({ x: bestQuad.intPtr(r, 0)[0], y: bestQuad.intPtr(r, 0)[1] });
                }
                const ordered = orderPoints(points);

                const widthA = Math.hypot(ordered[2].x - ordered[3].x, ordered[2].y - ordered[3].y);
                const widthB = Math.hypot(ordered[1].x - ordered[0].x, ordered[1].y - ordered[0].y);
                const maxWidth = Math.floor(Math.max(widthA, widthB));
                const heightA = Math.hypot(ordered[1].x - ordered[2].x, ordered[1].y - ordered[2].y);
                const heightB = Math.hypot(ordered[0].x - ordered[3].x, ordered[0].y - ordered[3].y);
                const maxHeight = Math.floor(Math.max(heightA, heightB));

                const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                  0, 0,
                  maxWidth - 1, 0,
                  maxWidth - 1, maxHeight - 1,
                  0, maxHeight - 1
                ]);

                const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                  ordered[0].x, ordered[0].y,
                  ordered[1].x, ordered[1].y,
                  ordered[2].x, ordered[2].y,
                  ordered[3].x, ordered[3].y
                ]);

                const M = cv.getPerspectiveTransform(srcTri, dstTri);
                const warped = new cv.Mat();
                const dsize = new cv.Size(maxWidth, maxHeight);
                cv.warpPerspective(src, warped, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

                // Optional auto enhancement: sharpen a bit
                const finalMat = new cv.Mat();
                const kernel = cv.matFromArray(3, 3, cv.CV_32F,
                  [0, -1, 0, -1, 5, -1, 0, -1, 0]);
                cv.filter2D(warped, finalMat, cv.CV_8U, kernel);

                cv.imshow('canvasOutput', finalMat);
                const canvas = document.getElementById('canvasOutput');
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                post('result', dataUrl);

                // clean
                src.delete(); gray.delete(); blur.delete(); contrast.delete(); edges.delete();
                contours.delete(); hierarchy.delete(); bestQuad.delete(); dstTri.delete(); srcTri.delete();
                M.delete(); warped.delete(); finalMat.delete(); kernel.delete();
              } catch (err) {
                post('error', err.message || 'Unknown error');
              }
            }

            let cvReady = false;
            let imgReady = false;
            function tryProcess() {
              if (cvReady && imgReady) {
                process();
              }
            }

            document.getElementById('imageSrc').onload = () => { imgReady = true; tryProcess(); };
          </script>
          <script async src="https://docs.opencv.org/4.x/opencv.js" onload="cv['onRuntimeInitialized']=()=>{cvReady=true; tryProcess();};" onerror="post('error','Gagal memuat OpenCV.js');"></script>
        </body>
      </html>
    `,
        [base64Image]
    );

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const { type, payload } = JSON.parse(event.nativeEvent.data);
            if (type === 'result') {
                onSuccess(payload);
            } else if (type === 'error') {
                onError(payload);
            }
        } catch (e) {
            onError('Gagal memproses pesan dari WebView');
        }
    };

    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
            <WebView
                originWhitelist={['*']}
                source={{ html }}
                onMessage={handleMessage}
                javaScriptEnabled
                domStorageEnabled
                style={styles.webview}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    spinner: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -20 }],
    },
    webview: {
        width: 1,
        height: 1,
        opacity: 0.01, // keep it invisible but mounted
    },
});
