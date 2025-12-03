import customtkinter as ctk

class AppUI:
    """
    A class representing the application's user interface.
    """
    WINDOW_TITLE = "CRAI Camera"
    WINDOW_SIZE = "1280x720"
    WINDOW_STATE = "zoomed"
    
    def __init__(self, camera):
        # Configure customtkinter appearance
        # ctk.set_appearance_mode("dark") 
        # ctk.set_default_color_theme("blue") 
        
        # Store camera reference
        self.camera = camera
        
        self.root = ctk.CTk()
        self.root.title(self.WINDOW_TITLE)
        self.root.after(0, lambda: self.root.state(self.WINDOW_STATE))
        
        self.create_main_frame()
        
    def create_main_frame(self):
        # Main container frame
        self.main_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        self.main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Configure grid of main frame
        self.main_frame.grid_columnconfigure(1, weight=1)
        self.main_frame.grid_rowconfigure(0, weight=1)
        
        # Create left container
        self.left_container = ctk.CTkFrame(self.main_frame, width=250, fg_color="transparent")
        self.left_container.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        self.left_container.grid_propagate(False)
        
        # Configure grid of left container
        self.left_container.grid_rowconfigure(0, weight=0)  # Title frame (fixed height)
        self.left_container.grid_rowconfigure(1, weight=1)  # Content frame (expandable)
        self.left_container.grid_columnconfigure(0, weight=1)
        
        # Create top left frame (for title) - transparent background
        self.left_top_frame = ctk.CTkFrame(self.left_container, height=60, fg_color="transparent")
        self.left_top_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        self.left_top_frame.grid_propagate(False)
        
        # Add title label
        self.title_label = ctk.CTkLabel(
            self.left_top_frame,
            text=self.WINDOW_TITLE,
            font=ctk.CTkFont(size=30, weight="bold")
        )
        self.title_label.pack(expand=True)
        
        # Create bottom left frame (for content)
        self.left_frame = ctk.CTkFrame(self.left_container, corner_radius=10)
        self.left_frame.grid(row=1, column=0, sticky="nsew")
        self.left_frame.grid_propagate(True)
        
        # Create right container
        self.right_container = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.right_container.grid(row=0, column=1, sticky="nsew")
        
        # Configure grid of right container
        self.right_container.grid_rowconfigure(0, weight=10)
        self.right_container.grid_rowconfigure(1, weight=1)
        self.right_container.grid_columnconfigure(0, weight=1)
        
        # Create right top frame (camera view) - transparent background
        self.right_top_frame = ctk.CTkFrame(self.right_container, corner_radius=10, fg_color="transparent")
        self.right_top_frame.grid(row=0, column=0, sticky="nsew", pady=(0, 10))
        
        # Create camera label to display video
        self.camera_label = ctk.CTkLabel(self.right_top_frame, text="")
        self.camera_label.pack(fill="both", expand=True)
        
        # Start camera feed
        self.update_camera()
        
        # Create right bottom frame
        self.right_bottom_frame = ctk.CTkFrame(self.right_container, corner_radius=10)
        self.right_bottom_frame.grid(row=1, column=0, sticky="nsew")
        self.right_bottom_frame.grid_propagate(True)
    
    def update_camera(self):
        """Update camera feed"""
        if self.camera.isOpened():
            ret, frame = self.camera.read()
            if ret:
                # Convert frame to CTkImage
                import cv2
                from PIL import Image
                
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Convert to PIL Image
                img = Image.fromarray(frame_rgb)
                
                # Get label size
                label_width = self.camera_label.winfo_width()
                label_height = self.camera_label.winfo_height()
                
                # Resize image to fit label (maintain aspect ratio)
                if label_width > 1 and label_height > 1:
                    img_ratio = img.width / img.height
                    label_ratio = label_width / label_height
                    
                    if img_ratio > label_ratio:
                        new_width = label_width
                        new_height = int(label_width / img_ratio)
                    else:
                        new_height = label_height
                        new_width = int(label_height * img_ratio)
                    
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Convert to CTkImage
                ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=(img.width, img.height))
                
                # Update label
                self.camera_label.configure(image=ctk_img)
                self.camera_label.image = ctk_img
        
        # Schedule next update (30 FPS = ~33ms)
        self.root.after(33, self.update_camera)