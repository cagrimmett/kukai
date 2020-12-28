import { Component, OnInit, Input } from '@angular/core';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import { AddressBookService, Contact, Alias, AliasKind } from '../../../services/address-book/address-book.service';
import { MessageService } from '../../../services/message/message.service';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent implements OnInit {
  @Input() toPkh: string;
  @Input() torusVerifier: AliasKind;
  @Input() torusLookupAddress: string;
  @Input() torusLookupId: string;
  @Input() torusTwitterId: string;
  @Input() torusPendingLookup: string;
  active = false;
  address = '';
  name = '';
  aliasValue = '';
  errorMsg = '';
  /*
    torusVerifier = '';
  torusPendingLookup = false;
  torusLookupAddress = '';
  torusLookupId = '';
  torusTwitterId = '';*/
  constructor(
    private inputValidationService: InputValidationService,
    private addressBookService: AddressBookService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
  }
  display() {
    let address = '';
    if (this.torusVerifier) {
      address = this.torusLookupAddress;
    } else {
      address = this.toPkh;
    }
    return (this.inputValidationService.address(address) && !this.addressBookService.getContact(address));
  }
  add() {
    if (this.name) {
      const contact: Contact = { name: this.name, address: this.address };
      if (this.torusVerifier) {
        const alias: Alias = { value: this.torusLookupId, kind: this.torusVerifier };
        if (this.torusVerifier = 'twitter') {
          alias.twitterId = this.torusTwitterId;
        }
        contact.alias = alias;
      }
      try {
        this.addressBookService.addContact(contact);
        this.messageService.addSuccess(`${contact.name} added as new contact!`);
        this.close();
      } catch (e) {
        this.errorMsg = e.message;
      }
    } else {
      this.errorMsg = 'Must add a name for contact';
    }
  }
  open() {
    console.log('contact data', {
      toPkh: this.toPkh,
      torusVerifier: this.torusVerifier,
      torusLookupAddress: this.torusLookupAddress,
      torusLookupId: this.torusLookupId,
      torusTwitterId: this.torusTwitterId
    });
    if (this.torusVerifier) {
      if (!this.torusPendingLookup) {
        this.active = true;
        this.address = this.torusLookupAddress;
        this.aliasValue = this.toPkh;
      }
    } else {
      this.active = true;
      this.address = this.toPkh;
    }
  }
  close() {
    this.active = false;
    this.address = '';
    this.aliasValue = '';
    this.name = '';
    this.errorMsg = '';
  }
  getVerifierLabel() {
    switch (this.torusVerifier) {
      case 'google':
        return 'Google account';
      case 'reddit':
        return 'Reddit username';
      case 'twitter':
        return 'Twitter handle';
      default:
        return 'Account';
    }
  }
}
