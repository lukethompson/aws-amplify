import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { ConfirmSignUpClass } from './confirm-sign-up.class';
import { ConfirmSignUpComponentIonic } from './confirm-sign-up.component.ionic'
import { ConfirmSignUpComponentCore } from './confirm-sign-up.component.core';

@Component({
  selector: 'amplify-auth-confirm-sign-up',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class ConfirmSignUpComponent implements OnInit, OnDestroy {
  @Input() ionic: boolean
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.ionic ? new ComponentMount(ConfirmSignUpComponentIonic,{authState: ''}) : new ComponentMount(ConfirmSignUpComponentCore, {authState: ''});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<ConfirmSignUpClass>componentRef.instance).data = authComponent.data;
  }
}

