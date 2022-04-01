import { Component } from '@angular/core'
import { IpfsService } from "../../services/ipfs.service"
import { FormBuilder, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { GalleryService } from "../../services/gallery.service";
import {ethers} from "ethers";

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss']
})
export class UploadImageComponent {
  public uploadForm = this.fb.group({
    plate: this.fb.control('', Validators.required),
    color: this.fb.control('', Validators.required),
    price: this.fb.control('', Validators.required),
    year: this.fb.control('', Validators.required),
    fileUrl: this.fb.control('', Validators.required),
  })
  public uploadedImage = ''
  public formError = ''
  public isLoading = false

  constructor(
    private ipfs: IpfsService,
    private fb: FormBuilder,
    private router: Router,
    private gallery: GalleryService
  ) { }

  public async uploadImage(eventTarget: any) {
    const fileUrl = await this.ipfs.uploadFile(eventTarget.files[0])
    this.uploadedImage = fileUrl
    this.uploadForm.get('fileUrl')?.setValue(fileUrl)
  }

  public async onSubmit() {
    if (this.uploadForm.valid) {
      this.isLoading = true
      const plate = this.uploadForm.get('plate')?.value;
      const price = this.uploadForm.get('price')?.value;
      const color = this.uploadForm.get('color')?.value;
      const year = this.uploadForm.get('year')?.value;
      const fileUrl = this.uploadForm.get('fileUrl')?.value;
      let dataMeta = {
        name: plate,
        description: "token de prueba" + plate,
        image: fileUrl,
        attributes: [{
          trait_type: "price",
          value: parseInt(price)
        }]
      };
      const metaDataUrl = await this.ipfs.uploadFile(JSON.stringify(dataMeta));
      if (metaDataUrl && metaDataUrl != "") {
        let data = {
          plate: plate,
          year: year,
          price: price,
          color: color,
          fileUrl: fileUrl
        };
        const isItemCreated = await this.gallery.addImage(data, metaDataUrl);
        this.isLoading = false;
        if (isItemCreated) {
          await this.router.navigate(['/authors-images']);
        }
      }else {
        alert('error');
      }
      } else {
        console.error('form is not valid')
        this.formError = 'Form is not valid'
      }

  }
}
