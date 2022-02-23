import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Checksum, FrameNumber, ImageInfo, NodeData, ResolutionAndFormat, VolumeParameters } from "app/prototypes";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RenderService } from "../../services/render.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-view-image-dialog",
  templateUrl: "./view-image-dialog.component.html",
  styleUrls: ["./view-image-dialog.component.css"]
})
export class ViewImageDialogComponent implements OnInit, AfterViewInit {
  @ViewChild("image") image: ElementRef;
  frameMin: number;
  frameMax: number;
  angleMin: number;
  angleMax: number;
  vectorMin: number;
  vectorMax: number;
  gammaMin: number;
  gammaMax: number;
  frameValue: number;
  gammaValue: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  viewX: number;
  viewY: number;
  viewZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  rotateAngle: number;
  imageFormat: string;
  buttonEnabled: boolean;
  sliderLinked: boolean;
  linkIcon: string;
  lastSliderChange: number;
  resizeObserver: ResizeObserver;
  windowResized: boolean;
  renderingMode: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { nodeData: NodeData, imageData: ImageInfo },
    private renderService: RenderService,
    private snackBar: MatSnackBar
  ) {
    this.imageFormat = "webp";
    this.buttonEnabled = false;
    this.sliderLinked = false;
    this.linkIcon = "md-link_off";
    this.lastSliderChange = 0;
    this.windowResized = false;
    this.resizeObserver = new ResizeObserver(() => {
      this.windowResized = true;
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver.observe(this.image.nativeElement);
  }

  ngOnInit(): void {
    this.renderService.loadImage(this.data.nodeData.ip_address, this.data.nodeData.port_number, this.data.imageData).subscribe(
      () => {
        this.setResolutionAndFormat();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - Could not load image: error code ${error.status}`);
        this.snackBar.open("Error loading image on a server.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    this.frameMin = 0;
    this.frameMax = this.data.imageData.frames - 1;
    this.angleMin = -180;
    this.angleMax = 180;
    this.vectorMin = -10;
    this.vectorMax = 10;
    this.gammaMin = 1;
    this.gammaMax = 30;
    this.frameValue = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.translateZ = 0;
    this.rotateX = 0;
    this.rotateY = 1;
    this.rotateZ = 0;
    this.rotateAngle = 0;
    this.viewX = 0;
    this.viewY = 0;
    this.viewZ = 2;
    this.gammaValue = 20;
    this.renderingMode = "1";
  }

  getFrame(): void {
    const req: FrameNumber = {
      md5sum: this.data.imageData.md5sum,
      frame: this.frameValue
    };

    let delay = 0;

    if (this.windowResized == true) {
      this.windowResized = false;
      delay = 1000;
      this.setResolutionAndFormat();
    }

    setTimeout(() => {
      this.renderService.fetchFrame(this.data.nodeData.ip_address, this.data.nodeData.port_number, req).subscribe(
        (data: Blob) => {
          if (data === null) {
            this.snackBar.open("Image is still loading.", "",
              { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
          } else {
            URL.revokeObjectURL(this.image.nativeElement.src);
            this.image.nativeElement.src = URL.createObjectURL(data);
          }
        },
        (error: HttpErrorResponse) => {
          console.log(`ViewImageDialogComponent - Could not fetch image: error code ${error.status}`);
          this.snackBar.open("Error fetching image frame.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      );
    }, delay);
  }

  getVolume(): void {
    const req: VolumeParameters = {
      md5sum: this.data.imageData.md5sum,
      viewX: this.viewX,
      viewY: this.viewY,
      viewZ: this.viewZ,
      translateX: this.translateX,
      translateY: this.translateY,
      translateZ: this.translateZ,
      rotateX: this.rotateX,
      rotateY: this.rotateY,
      rotateZ: this.rotateZ,
      rotateAngle: this.rotateAngle,
      gamma: this.gammaValue / 10.0,
      renderingMode: parseInt(this.renderingMode, 10)
    };

    let delay = 0;

    if (this.windowResized == true) {
      this.windowResized = false;
      delay = 1000;
      this.setResolutionAndFormat();
    }

    setTimeout(() => {
      this.renderService.fetchVolume(this.data.nodeData.ip_address, this.data.nodeData.port_number, req).subscribe(
        (data: Blob) => {
          if (data === null) {
            this.snackBar.open("Image is still loading.", "",
              { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
          } else {
            URL.revokeObjectURL(this.image.nativeElement.src);
            this.image.nativeElement.src = URL.createObjectURL(data);
          }
        },
        (error: HttpErrorResponse) => {
          console.log(`ViewImageDialogComponent - Could not fetch volume: error code ${error.status}`);
          this.snackBar.open("Error fetching volume.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      );
    }, delay);
  }

  close(): void {
    const req: Checksum = {
      md5sum: this.data.imageData.md5sum
    };

    URL.revokeObjectURL(this.image.nativeElement.src);

    this.resizeObserver.unobserve(this.image.nativeElement);

    this.renderService.unloadImage(this.data.nodeData.ip_address, this.data.nodeData.port_number, req).subscribe(
      () => {
      },
      (error: HttpErrorResponse) => {
        console.log(`ViewImageDialogComponent - Could not unload image: error code ${error.status}`);
        this.snackBar.open("Error unloading image on a server.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  setResolutionAndFormat(): void {
    const req: ResolutionAndFormat = {
      md5sum: this.data.imageData.md5sum,
      width: (this.image.nativeElement as HTMLImageElement).width,
      height: (this.image.nativeElement as HTMLImageElement).height,
      format: this.imageFormat
    };

    this.renderService.setResolutionAndFormat(this.data.nodeData.ip_address, this.data.nodeData.port_number, req).subscribe(
      () => {
        this.buttonEnabled = true;
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - Could set image resolution and format: error code ${error.status}`);
        this.snackBar.open("Error setting image resolution and format.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });

      }
    );
  }

  changeResolutionAndFormat(event: Event): void {
    this.imageFormat = (event.target as HTMLSelectElement).value;
    this.setResolutionAndFormat();
  }

  increaseSlider(): void {
    if (this.frameValue < this.data.imageData.frames - 1) {
      this.frameValue++;
    }

    this.sliderChangeValue();
  }

  decreaseSlider(): void {
    if (this.frameValue >= 1) {
      this.frameValue--;
    }

    this.sliderChangeValue();
  }

  sliderLink(): void {
    if (this.sliderLinked == true) {
      this.sliderLinked = false;
      this.linkIcon = "md-link_off";
    } else {
      this.sliderLinked = true;
      this.linkIcon = "md-link";
    }
  }

  sliderChangeValue(): void {
    const now: number = Date.now();

    if (this.sliderLinked == true) {
      if (now >= this.lastSliderChange + 1000) {

        this.getFrame();
      } else {
        setTimeout(() => {
          if (Date.now() >= this.lastSliderChange + 1000) {
            this.getFrame();
          }
        }, 1000);
      }
    }

    this.lastSliderChange = now;
  }

}


