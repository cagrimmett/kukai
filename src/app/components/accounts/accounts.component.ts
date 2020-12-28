import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import * as copy from 'copy-to-clipboard';
import { TranslateService } from '@ngx-translate/core'; // Multiple instances created ?
import { MessageService } from '../../services/message/message.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { AddressBookService } from '../../services/address-book/address-book.service';
import {
  ImplicitAccount,
  OriginatedAccount,
  Account,
  HdWallet,
} from '../../services/wallet/wallet';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  wideAccounts = false;
  implicitAccounts: ImplicitAccount[];
  constructor(
    public walletService: WalletService,
    private router: Router,
    private translate: TranslateService,
    private messageService: MessageService,
    private coordinatorService: CoordinatorService,
    private addressBookService: AddressBookService
  ) { }

  ngOnInit(): void {
    if (!this.walletService.wallet) {
      this.router.navigate(['']);
    } else {
      this.onResize();
      this.coordinatorService.startAll();
      this.implicitAccounts = this.walletService.wallet.implicitAccounts;
    }
  }
  copy(account: Account) {
    copy(account.address);
    const copyToClipboard = this.translate.instant(
      'OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD'
    );
    this.messageService.add(account.address + ' ' + copyToClipboard, 5);
  }
  select(account: Account) {
    this.router.navigate(['account', account.address]);
  }
  @HostListener('window:resize')
  onResize() {
    this.wideAccounts = (window.innerWidth > 640);
  }
  formatAddress(account: Account) {
    const name = this.addressBookService.getName(account.address);
    if (name) {
      return name;
    } else if (this.wideAccounts) {
      return account.address;
    } else {
      return account.shortAddress();
    }
  }
}
