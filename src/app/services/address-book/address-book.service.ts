import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { utils } from '@tezos-core-tools/crypto-utils';

export interface Contact {
  name: string;
  address: string;
  internal?: boolean;
  alias?: Alias;
}
export interface Alias {
  kind: AliasKind;
  value: string;
  twitterId?: string;
}
export type AliasKind = 'google' | 'reddit' | 'twitter' | '';
const storeKey = 'address-book';
export type AddressBook = Record<string, Contact>;
type AddressBooks = Record<string, AddressBook>;
@Injectable({
  providedIn: 'root'
})
export class AddressBookService {
  private addressBooks: AddressBooks = {};
  constructor(
    private walletService: WalletService
  ) {
    this.initAddressBooks();
  }

  addContact(contact: Contact) {
    console.log('Add contact', contact);
    if (this.walletService.wallet) {
      if (!contact.name) {
        throw new Error('Invalid name!');
      } else if (!utils.validAddress(contact.address)) {
        throw new Error('Invalid address!');
      }
      if (contact.alias && !contact.alias.kind) {
        throw new Error('No alias kind');
      }
      const walletMainAddress = this.walletService.wallet.implicitAccounts[0].pkh;
      if (!this.addressBooks[walletMainAddress]) {
        this.addressBooks[walletMainAddress] = {};
      }
      if (!this.addressBooks[walletMainAddress][contact.address]) {
        if (this.walletService.wallet.getAccount(contact.address)) {
          contact.internal = true;
        }
        this.addressBooks[walletMainAddress][contact.address] = contact;
        this.storeAddressBooks();
      } else {
        throw new Error('Address already exists in address book!');
      }
    }
  }
  getAddressBook(): AddressBook {
    if (this.walletService.wallet) {
      const walletMainAddress = this.walletService.wallet.implicitAccounts[0].pkh;
      if (this.addressBooks[walletMainAddress]) {
        return this.addressBooks[walletMainAddress];
      } else {
        this.addressBooks[walletMainAddress] = {};
        return this.addressBooks[walletMainAddress];
      }
    }
    return null;
  }
  getContact(address: string): Contact {
    const addressBook = this.getAddressBook();
    if (addressBook?.[address]) {
      return addressBook[address];
    }
    return null;
  }
  removeContact(address: string) {
    const addressBook = this.getAddressBook();
    if (this.getContact(address)) {
      delete addressBook[address];
      this.storeAddressBooks();
    }
  }
  getName(address: string, returnValueCanBeEmpty = true): string {
    const contact = this.getContact(address);
    if (contact) {
      return contact.name;
    }
    return null;
  }
  lookupPkh(aliasKind: string, value: string) {
    const addressBook = this.getAddressBook();
    if (addressBook) {
      const contactAddresses = Object.keys(addressBook);
      for (const contactAddress of contactAddresses) {
        if (addressBook[contactAddress]?.alias?.kind === aliasKind &&
          addressBook[contactAddress]?.alias?.value === value) {
          let twitterId = '';
          if (aliasKind = 'twitter') {
            twitterId = addressBook[contactAddress].alias.twitterId;
          }
          return { pkh: addressBook[contactAddress].address, twitterId };
        }
      }
    }
    return null;
  }
  private initAddressBooks() {
    const addressBooksJson = localStorage.getItem(storeKey);
    if (addressBooksJson) {
      const addressBooks = JSON.parse(addressBooksJson);
      if (addressBooks) {
        this.addressBooks = addressBooks;
      }
    }
  }
  private storeAddressBooks() {
    const size = Object.keys(this.getAddressBook()).length;
    console.log('size', size);
    if (size) {
      localStorage.setItem(storeKey, JSON.stringify(this.addressBooks));
    } else {
      const addressBooksClone: AddressBooks = JSON.parse(JSON.stringify(this.addressBooks));
      const walletMainAddress = this.walletService.wallet.implicitAccounts[0].pkh;
      delete addressBooksClone[walletMainAddress];
      console.log(addressBooksClone);
      localStorage.setItem(storeKey, JSON.stringify(addressBooksClone));
    }
  }
}
