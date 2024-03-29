import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../shared/Auth/auth.service";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private auth: AuthService) {}
  converse;
  newMessageText;
  insideView = false;
  hisBookPic;
  myBookPic;

  conversationSession;
  sessionID = JSON.parse(localStorage.getItem('conversation_ex_id'))['exchange_id'];
  firstUser = JSON.parse(localStorage.getItem('userData'))['userName'];
  initiator = JSON.parse(localStorage.getItem('initiator') );

  ngOnInit(): void {
    setTimeout(() => {
      this.auth.search.updatePosition(true);
    }, 0);
    this.insideView = true;

    this.auth.message.dataID.subscribe(data => {
      if (data)
        this.conversationSession = data;
      else {
        let x = localStorage.getItem('conversation_ex_id')
        if (!x)
          this.auth.router.navigate(['']).then();
        this.conversationSession = x;

        data = JSON.parse(x);
      }
      this.getMessages(data, this.insideView)
    });

    this.auth.bookService.getBook(+JSON.parse(localStorage.getItem('conversation_ex_id'))['his_book_id'])
      .subscribe((book) => {
        book["coverPage"] = this.auth.shared.getLargeImg(book["coverPage"], this.auth.shared.getPosition(book["coverPage"], "m/", 2))
        this.hisBookPic = book["coverPage"]
      });
    this.auth.bookService.getBook(+JSON.parse(localStorage.getItem('conversation_ex_id'))['my_book_id'])
      .subscribe((book) => {
        book["coverPage"] = this.auth.shared.getLargeImg(book["coverPage"], this.auth.shared.getPosition(book["coverPage"], "m/", 2))
        this.myBookPic = book["coverPage"]
      });

    setTimeout(() => {
      document.querySelector("#span-messaging").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    }, 5000);
  }

  getMessages(messageData, inView) {
    if (inView)
      this.auth.message.getConversation(messageData.exchange_id).subscribe(value => {
        this.converse = value
      }, error => {
        if (error.error['message'] == 'error' || error.error['message'] == "You don't have access to this conversation.") {
          localStorage.removeItem('conversation_ex_id')
          this.auth.router.navigate(['app']).then()
        }
      });
  }

  sendMessage(id: number) {
    if (this.newMessageText.length > 0) {
      let mess = this.newMessageText;
      this.newMessageText = '';
      this.auth.message.sendMessage(id, mess).subscribe(() => {
        this.getMessages(JSON.parse(localStorage.getItem('conversation_ex_id')), this.insideView)
        document.querySelector("#span-messaging").scrollIntoView();
        setTimeout(() => {
          document.querySelector("#span-messaging").scrollIntoView();
        }, 3000)
      });
    }
  }

  accept(stationID: any, accToF: boolean) {
    this.auth.message.acceptEx(stationID, accToF).subscribe(value => {
      if (value['message'] == 'error' || value['message'] == "You don't have access to this conversation.") {
        localStorage.removeItem('conversation_ex_id')
      }
    })
  }

  ngAfterViewInit(): void {
    setInterval(() => {
      this.getMessages(JSON.parse(localStorage.getItem('conversation_ex_id')), this.insideView)
    }, 5000);
  }

  ngOnDestroy(): void {
    this.insideView = false;
    this.getMessages(JSON.parse(localStorage.getItem('conversation_ex_id')), this.insideView)
  }
}
