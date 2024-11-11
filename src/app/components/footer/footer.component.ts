import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent  implements OnInit {
  showFooter: boolean = true; // Inicialmente, el footer es visible

  constructor() { }

  ngOnInit() {
    this.showFooter = true;
  }

  

  ocultarFooter() {
    this.showFooter = false; // Cambia el estado de showFooter a false
  }
}
