# AI

- https://pyimagesearch.com/start-here/
- https://pyimagesearch.com/category/optical-character-recognition-ocr/
- https://pyimagesearch.com/2020/09/21/opencv-automatic-license-number-plate-recognition-anpr-with-python/
- https://pyimagesearch.com/2019/12/02/opencv-vehicle-detection-tracking-and-speed-estimation/
- https://github.com/JaviFS97/TFG
- https://colab.research.google.com/github/Admindatosgobes/Laboratorio-de-Datos/blob/main/Data%20Science/Ruta%20a%20la%20electrificaci%C3%B3n%20de%20la%20Movilidad/Codigo/Notebook.ipynb#scrollTo=3cc24845-3f0d-4c75-b12a-572d8299c127
- https://patricia-schutter.medium.com/car-image-recognition-with-convolutional-neural-network-applications-e791c98c9d72
- https://github.com/ajayrawatsap/Identify-a-Car-Model-with-Deep-Learning
- https://datasetsearch.research.google.com/search?src=2&query=88%2C000%2B%20Images%20of%20Cars&docid=L2cvMTFrcGZoM2swcQ%3D%3D
- https://github.com/ramajoballester/UC3M-LP?tab=readme-ov-file


## Quick start
- wsl --install
- wsl --update
- https://developer.nvidia.com/cuda/wsl
- sudo apt install -y cuda-toolkit-12-6
- nvidia-smi

sudo apt install python3-venv
python3 -m venv tfenv
source tfenv/bin/activate

pip install --upgrade pip setuptools wheel
pip install tensorflow

python3 - <<EOF
import tensorflow as tf
print("GPUs:", tf.config.list_physical_devices('GPU'))
EOF