import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {Term} from "../shared/term";
import {TermService} from "../shared/term.service";
import {Toasts} from "../../shared/toasts";
import {ToastsManager} from "ng2-toastr";

@Component({
  selector: 'app-term-detail',
  templateUrl: './term-detail.component.html',
  styleUrls: ['./term-detail.component.css']
})
export class TermDetailComponent extends Toasts implements OnInit {

  @Input() term: Term;

  constructor(private termSvc: TermService, public toastr: ToastsManager, vcr: ViewContainerRef) {
    super(toastr, vcr);
  }

  ngOnInit() {
  }

  deleteTerm() {
      this.termSvc.deleteTerm(this.term.$key).then(() => {
        this.showSuccess('Term Deleted');
      }, () => {
        this.showError('Error, Please Try Again!');
      });
  }

}
