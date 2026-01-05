import sys
import os

class Terminal:
    
    @staticmethod
    def start():
        """Initializes the terminal interface."""
        Terminal.clear()
        Terminal.print_banner()
        # No registramos signal handler - dejamos que Python maneje Ctrl+C naturalmente
    
    @staticmethod
    def clear():
        """Clears the terminal screen."""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    @staticmethod
    def print_banner():
        """Prints a simple banner."""
        banner = """
            ══════════════════════════════════════════════════════════════
                
             ██████╗██████╗  █████╗ ██╗
            ██╔════╝██╔══██╗██╔══██╗██║
            ██║     ██████╔╝███████║██║    Car Registration
            ██║     ██╔══██╗██╔══██║██║    Artifucial Intelligence
            ╚██████╗██║  ██║██║  ██║██║
             ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝    v1.0.0
                
             🚗 Vehicle Detection  •  📋 License Plates  •  ⚡ AI-Powered
                
            ══════════════════════════════════════════════════════════════
        """
        print(banner)
    
    @staticmethod
    def print_info():
        """Prints an informational message."""
        print("\n" + "="*60)
        print("✓ SYSTEM READY")
        print("="*60)
        print("\nControls:")
        print("  'q' - Quit")
        print("  's' - Save screenshot")
        print("  'd' - Toggle debug mode")
        print("  'r' - Reset OCR cache")
        print("  'c' - Show configuration")
        print("="*60 + "\n")