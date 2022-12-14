import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../services/message/messages.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  constructor(private message: MessagesService, private router: Router) {
  }

  conver;
  conversationSation;
  sationID = JSON.parse(localStorage.getItem('conversation_ex_id'))['exchange_id'];
  firstUser = JSON.parse(localStorage.getItem('userData'))['userName'];
  newMessageText;

  ngOnInit(): void {
    this.message.dataID.subscribe(data => {
      if (data) this.conversationSation = data;
      else {
        let x = localStorage.getItem('conversation_ex_id')
        if (!x) this.router.navigate(['']).then();
        data = JSON.parse(x);
      }
      this.getMessages(data)
    });
    setInterval(() => {
      this.getMessages(JSON.parse(localStorage.getItem('conversation_ex_id')))
    }, 2000);
    document.querySelector("#span-messaging").scrollIntoView();
  }

  getMessages(messageData) {
    this.message.getConversation(messageData.exchange_id).subscribe(value => {
      this.conver = value
      console.log(this.conversationSation)
    });
  }

  sendMessage(id: number) {
    if (this.newMessageText.length > 1)
      this.message.sendMessage(id, this.newMessageText).subscribe(() => {
        document.querySelector("#span-messaging").scrollIntoView();
        this.newMessageText = '';
        this.getMessages(JSON.parse(localStorage.getItem('conversation_ex_id')))
      });
  }
}
