import { Component, OnInit, HostListener } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { BeaconService } from '../../services/beacon/beacon.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { AddressBookService, Contact, AddressBook, AliasKind } from '../../services/address-book/address-book.service';
import { TorusService } from '../../services/torus/torus.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  implicitAccounts = [];
  addressBook: AddressBook;
  wideAccounts = false;
  name = '';
  address = '';
  torusVerifier: AliasKind = '';
  loading = false;
  constructor(
    public beaconService: BeaconService,
    private messageService: MessageService,
    private walletService: WalletService,
    private router: Router,
    public torusService: TorusService,
    public addressBookService: AddressBookService,
    private inputValidationService: InputValidationService
  ) { }

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.implicitAccounts = this.walletService.wallet.getImplicitAccounts();
      this.beaconService.syncBeaconState();
      this.addressBook = this.addressBookService.getAddressBook();
      console.log(this.addressBook);
      this.onResize();
    } else {
      this.router.navigate(['']);
    }
  }
  accountAvailable(pkh: string): boolean {
    const index = this.implicitAccounts.findIndex((impAcc: any) => impAcc.pkh === pkh);
    if (index === -1) {
      return false;
    }
    return true;
  }
  @HostListener('window:resize')
  onResize() {
    this.wideAccounts = (window.innerWidth > 600);
  }
  formatAddress(address: string) {
    if (this.wideAccounts) {
      return address;
    } else {
      return address.slice(0, 6) + '...' + address.slice(-4);
    }
  }
  async addContact() {
    if (!this.loading) {
      try {
        this.loading = true;
        let contact: Contact;
        if (this.torusVerifier) {
          const valid = this.inputValidationService.torusAccount(this.address, this.torusVerifier);
          if (valid) {
            const { pkh, twitterId } = (await this.torusService.lookupPkh(this.torusVerifier, this.address));
            contact = { name: this.name, address: pkh, alias: { kind: this.torusVerifier, value: this.address } };
            if (twitterId) {
              contact.alias.twitterId = twitterId;
            }
          } else {
            throw new Error(`Invalid ${this.torusService.verifierMap[this.torusVerifier].name} account`);
          }
        } else {
          contact = { name: this.name, address: this.address };
        }
        this.addressBookService.addContact(contact);
        this.name = '';
        this.address = '';
      } catch (e) {
        this.messageService.addError(e.message);
      } finally {
        this.loading = false;
      }
    }
  }
  placeholder() {
    if (!this.torusVerifier) {
      return 'Tezos Address';
    }
    return this.torusService.verifierMap[this.torusVerifier].name + ' Account';
  }
}
