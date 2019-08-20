import sys
import cv2
import numpy as np 
import pyautogui
from PIL import ImageDraw, ImageGrab
from base_camera import BaseCamera


class Camera(BaseCamera):

    @staticmethod
    def frames():
        while True:
            img = ImageGrab.grab()
            img = Camera.draw_mouse(img)
            img_np = np.array(img)
            frame = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
            ret, jpeg = cv2.imencode('.jpg', frame)
            yield jpeg.tobytes()


    @staticmethod
    def draw_mouse(img):
        draw = ImageDraw.Draw(img)
        pos = pyautogui.position()
        ax, ay, bx, by = pos[0], pos[1], pos[0]+10, pos[1]+10
        draw.ellipse((ax,ay,bx,by), fill="yellow")
        return img