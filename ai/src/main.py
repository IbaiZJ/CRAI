import cv2

# if __name__ == "__main__":
#     # Initialize camera
#     camera = cv2.VideoCapture(0)  # 0 = default camera
    
#     # Check if camera opened successfully
#     if not camera.isOpened():
#         print("Error: No se pudo abrir la cámara")
    
#     # Create UI with camera
#     app = AppUI(camera)
    
#     # Start main loop
#     try:
#         app.root.mainloop()
#     finally:
#         # Release camera when closing
#         if camera.isOpened():
#             camera.release()
#         cv2.destroyAllWindows()