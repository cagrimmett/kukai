import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Account, ImplicitAccount, TorusWallet } from '../../../services/wallet/wallet';
import { WalletService } from '../../../services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { TokenService } from '../../../services/token/token.service';
import { CONSTANTS } from '../../../../environments/environment';
import { ModalComponent } from '../../modal/modal.component';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { DisplayLinkOption } from '../../../interfaces';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/nfts.component.scss'],
})
export class NftsComponent implements OnInit, AfterViewInit {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  Number = Number;
  nfts = {};
  isDiscover: boolean = true;
  filter: string = 'APPS';
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    public tokenBalancesService: TokenBalancesService,
    private subjectService: SubjectService,
    private walletService: WalletService
  ) { }
  @Input() activity: any;
  @Input() account;
  ngOnInit(): void {
    this.subjectService.nftsUpdated.subscribe(nfts => {
      if (Object.keys(nfts)?.length) {
        this.filter = 'APP';
        this.isDiscover = false;
      } else {
        this.isDiscover = true;
      }
      this.nfts = nfts;
    });
    this.subjectService.nftsUpdated.pipe(last()).subscribe(nfts => {
      this.nfts = nfts;
    });
  }
  ngAfterViewInit() {
  }
  displayTokenCard(): boolean {
    return (this.account instanceof ImplicitAccount) || (this.account?.tokens?.length > 0);
  }
  toggleDropdown(sel) {
    const elem = [].slice.call(document.querySelectorAll(`.nfts .collection`));
    const c = document.querySelector(sel).classList.contains('expanded');
    elem.forEach(token => { if (token.classList.contains('expanded')) { token.classList.toggle('expanded'); token.querySelector('.body').scrollTop = 0; } });
    if (!c) { document.querySelector(sel).classList.toggle('expanded'); }
  }
  viewToken(token) {
    ModalComponent.currentModel.next({ name: 'token-detail', data: token });
  }
  shouldDisplayLink(option: DisplayLinkOption) {
    if (option === 0 || (option === 1 && this.walletService.wallet instanceof TorusWallet)) {
      return true;
    }
    return false;
  }
  trackToken(index: number, token: any) {
    return token?.id ? token.contractAddress + ':' + token?.id + ':' + token?.balance : null;
  }
}