import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { PaymentMethodType } from 'jslib-common/enums/paymentMethodType';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { ConstantsService } from 'jslib-common/services/constants.service';

import { WebConstants } from '../../services/webConstants';

const lightInputColor = '#465057';
const lightInputPlaceholderColor = '#B6B8B8';
const darkInputColor = '#FFFFFF';
const darkInputPlaceholderColor = '#BAC0CE';

@Component({
    selector: 'app-payment',
    templateUrl: 'payment.component.html',
})
export class PaymentComponent implements OnInit {
    @Input() showMethods = true;
    @Input() showOptions = true;
    @Input() method = PaymentMethodType.Card;
    @Input() hideBank = false;
    @Input() hidePaypal = false;
    @Input() hideCredit = false;

    bank: any = {
        routing_number: null,
        account_number: null,
        account_holder_name: null,
        account_holder_type: '',
        currency: 'USD',
        country: 'US',
    };

    paymentMethodType = PaymentMethodType;

    private btScript: HTMLScriptElement;
    private btInstance: any = null;
    private stripeScript: HTMLScriptElement;
    private stripe: any = null;
    private stripeElements: any = null;
    private stripeCardNumberElement: any = null;
    private stripeCardExpiryElement: any = null;
    private stripeCardCvcElement: any = null;
    private theme: any = null;
    private StripeElementStyle: any;
    private StripeElementClasses: any;

    constructor(private platformUtilsService: PlatformUtilsService, private apiService: ApiService, private storageService: StorageService) {
        this.stripeScript = window.document.createElement('script');
        this.stripeScript.src = 'https://js.stripe.com/v3/';
        this.stripeScript.async = true;
        this.stripeScript.onload = () => {
            this.stripe = (window as any).Stripe(process.env.ENV === 'production'  ?
                WebConstants.stripeLiveKey : WebConstants.stripeTestKey);
            this.stripeElements = this.stripe.elements();
            this.setStripeElement();
        };
        this.btScript = window.document.createElement('script');
        this.btScript.src = `scripts/dropin.js?cache=${process.env.CACHE_TAG}`;
        this.btScript.async = true;
        this.StripeElementStyle = {
            base: {
                color: null,
                fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif, ' +
                    '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                fontSize: '14px',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: null,
                },
            },
            invalid: {
                color: null,

            },
        };
        this.StripeElementClasses = {
            focus: 'is-focused',
            empty: 'is-empty',
            invalid: 'is-invalid',
        };
    }

    async ngOnInit() {
        if (!this.showOptions) {
            this.hidePaypal = this.method !== PaymentMethodType.PayPal;
            this.hideBank = this.method !== PaymentMethodType.BankAccount;
            this.hideCredit = this.method !== PaymentMethodType.Credit;
        }
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
        if (this.theme == null) {
            this.theme = await this.platformUtilsService.getDefaultSystemTheme();
        }
        if (this.theme === 'light') {
            this.StripeElementStyle.base.color = lightInputColor;
            this.StripeElementStyle.base['::placeholder'].color = lightInputPlaceholderColor;
            this.StripeElementStyle.invalid.color = lightInputColor;
        } else {
            this.StripeElementStyle.base.color = darkInputColor;
            this.StripeElementStyle.base['::placeholder'].color = darkInputPlaceholderColor;
            this.StripeElementStyle.invalid.color = darkInputColor;
        }
        window.document.head.appendChild(this.stripeScript);
        if (!this.hidePaypal) {
            window.document.head.appendChild(this.btScript);
        }
    }

    ngOnDestroy() {
        window.document.head.removeChild(this.stripeScript);
        window.setTimeout(() => {
            Array.from(window.document.querySelectorAll('iframe')).forEach(el => {
                if (el.src != null && el.src.indexOf('stripe') > -1) {
                    try {
                        window.document.body.removeChild(el);
                    } catch { }
                }
            });
        }, 500);
        if (!this.hidePaypal) {
            window.document.head.removeChild(this.btScript);
            window.setTimeout(() => {
                Array.from(window.document.head.querySelectorAll('script')).forEach(el => {
                    if (el.src != null && el.src.indexOf('paypal') > -1) {
                        try {
                            window.document.head.removeChild(el);
                        } catch { }
                    }
                });
                const btStylesheet = window.document.head.querySelector('#braintree-dropin-stylesheet');
                if (btStylesheet != null) {
                    try {
                        window.document.head.removeChild(btStylesheet);
                    } catch { }
                }
            }, 500);
        }
    }

    changeMethod() {
        this.btInstance = null;
        if (this.method === PaymentMethodType.PayPal) {
            window.setTimeout(() => {
                (window as any).braintree.dropin.create({
                    authorization: this.platformUtilsService.isDev() ?
                        WebConstants.btSandboxKey : WebConstants.btProductionKey,
                    container: '#bt-dropin-container',
                    paymentOptionPriority: ['paypal'],
                    paypal: {
                        flow: 'vault',
                        buttonStyle: {
                            label: 'pay',
                            size: 'medium',
                            shape: 'pill',
                            color: 'blue',
                        },
                    },
                }, (createErr: any, instance: any) => {
                    if (createErr != null) {
                        // tslint:disable-next-line
                        console.error(createErr);
                        return;
                    }
                    this.btInstance = instance;
                });
            }, 250);
        } else {
            this.setStripeElement();
        }
    }

    createPaymentToken(): Promise<[string, PaymentMethodType]> {
        return new Promise((resolve, reject) => {
            if (this.method === PaymentMethodType.Credit) {
                resolve([null, this.method]);
            } else if (this.method === PaymentMethodType.PayPal) {
                this.btInstance.requestPaymentMethod().then((payload: any) => {
                    resolve([payload.nonce, this.method]);
                }).catch((err: any) => {
                    reject(err.message);
                });
            } else if (this.method === PaymentMethodType.Card || this.method === PaymentMethodType.BankAccount) {
                if (this.method === PaymentMethodType.Card) {
                    this.apiService.postSetupPayment().then(clientSecret =>
                        this.stripe.handleCardSetup(clientSecret, this.stripeCardNumberElement))
                        .then((result: any) => {
                            if (result.error) {
                                reject(result.error.message);
                            } else if (result.setupIntent && result.setupIntent.status === 'succeeded') {
                                resolve([result.setupIntent.payment_method, this.method]);
                            } else {
                                reject();
                            }
                        });
                } else {
                    this.stripe.createToken('bank_account', this.bank).then((result: any) => {
                        if (result.error) {
                            reject(result.error.message);
                        } else if (result.token && result.token.id != null) {
                            resolve([result.token.id, this.method]);
                        } else {
                            reject();
                        }
                    });
                }
            }
        });
    }

    handleStripeCardPayment(clientSecret: string, successCallback: () => Promise<any>): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            if (this.showMethods && this.stripeCardNumberElement == null) {
                reject();
                return;
            }
            const handleCardPayment = () => this.showMethods ?
                this.stripe.handleCardSetup(clientSecret, this.stripeCardNumberElement) :
                this.stripe.handleCardSetup(clientSecret);
            return handleCardPayment().then(async (result: any) => {
                if (result.error) {
                    reject(result.error.message);
                } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                    if (successCallback != null) {
                        await successCallback();
                    }
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    private setStripeElement() {
        window.setTimeout(() => {
            if (this.showMethods && this.method === PaymentMethodType.Card) {
                if (this.stripeCardNumberElement == null) {
                    this.stripeCardNumberElement = this.stripeElements.create('cardNumber', {
                        style: this.StripeElementStyle,
                        classes: this.StripeElementClasses,
                        placeholder: '',
                    });
                }
                if (this.stripeCardExpiryElement == null) {
                    this.stripeCardExpiryElement = this.stripeElements.create('cardExpiry', {
                        style: this.StripeElementStyle,
                        classes: this.StripeElementClasses,
                    });
                }
                if (this.stripeCardCvcElement == null) {
                    this.stripeCardCvcElement = this.stripeElements.create('cardCvc', {
                        style: this.StripeElementStyle,
                        classes: this.StripeElementClasses,
                        placeholder: '',
                    });
                }
                this.stripeCardNumberElement.mount('#stripe-card-number-element');
                this.stripeCardExpiryElement.mount('#stripe-card-expiry-element');
                this.stripeCardCvcElement.mount('#stripe-card-cvc-element');
            }
        }, 50);
    }
}
