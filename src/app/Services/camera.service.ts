import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }

  // Verifica permisos solo si es un dispositivo nativo
  private async checkPermissions(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const permissions = await Camera.checkPermissions();
    if (permissions.camera !== 'granted') {
      const request = await Camera.requestPermissions();
      if (request.camera !== 'granted') {
        throw new Error('Permisos de cámara no otorgados');
      }
    }
  }

  // Toma una foto
  async takePicture(): Promise<string> {
    await this.checkPermissions();

    // Siempre usa la cámara en cualquier plataforma
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera // Siempre usa la cámara, incluso en la web
    });

    return image.webPath ?? ''; // Retorna la imagen en formato webPath
  }
}
