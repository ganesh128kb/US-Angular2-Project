import { Directive, Renderer, ElementRef, OnInit } from '@angular/core';

@Directive({
	selector: '[scrollbar]',
	host: {'(window:scroll)': 'track($event)'}
})

export class ScrollBarDirective {

	constructor(
        private renderer: Renderer,
        private el : ElementRef
    ){}

	ngOnInit(): void {
		// this.renderer.setElementStyle (this.el.nativeElement, 'backgroundColor', '#FFF' );
		//console.log('Test Directive');
	}

	track($event: Event) {
		let scrollPos = document.body.scrollTop;
		const element = this.el.nativeElement;
		const heightCheck = element.parentNode.offsetHeight;
		const child = element.firstChild;

		if(heightCheck && scrollPos >= 93){
			this.renderer.setElementStyle(element, 'position', 'fixed');
			this.renderer.setElementStyle(element, 'visibility', 'visible');
			this.renderer.setElementStyle(element, 'display', 'block');
		}
		else{
			this.renderer.setElementStyle(element, 'position', 'absolute');
			this.renderer.setElementStyle(element, 'visibility', 'hidden');
			this.renderer.setElementStyle(element, 'display', 'none');
		}

		//console.log( scrollPos );
        //console.debug("Scroll Event", $event);
    }

}//.filter__base .open>.dropdown-menu
