import { NgModule } from '@angular/core';

import { ScrollBarDirective } from './directives/scrollbar.directive';

@NgModule({
	declarations: [
		ScrollBarDirective
	],
	exports: [
		ScrollBarDirective
	]
})

export class SharedModule {}