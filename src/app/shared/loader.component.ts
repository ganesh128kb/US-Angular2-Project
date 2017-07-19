import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'loader',
    template: `
		<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	    viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
	  <rect stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 3 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"/>
	  </rect>
	  <rect x="17" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 20 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.1s"/>
	  </rect>
	  <rect x="40" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 40 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.3s"/>
	  </rect>
	  <rect x="60" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 58 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.5s"/>
	  </rect>
	  <rect x="80" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 76 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.1s"/>
	  </rect>
	  </svg>
	  <div class="text-center brand-color">Gathering data from around the world ... </div>
		`,
    styleUrls: ['../../assets/sass/app.component.sass']
})

export class LoaderComponent {

    constructor(private route: ActivatedRoute,
        private location: Location) { }

}
