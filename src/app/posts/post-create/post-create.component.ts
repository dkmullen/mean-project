import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PostsService } from '../posts.service';

@Component({
  selector: '<app-post-create>',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  enteredTitle = '';
  enteredContent = '';
  // @Output() postCreated = new EventEmitter();

  constructor(public postsService: PostsService) { }

  ngOnInit() {

  }

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.postsService.addPosts(form.value.title, form.value.content);
    form.resetForm();
  }

}

// @Output makes it possible for postCreated to emit to the parent
