import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Post } from './post.model';

// Injectable is an alt method to listing this service under providers in app.module
// providing at root makes it available everwhere in the app, and only one copy is ever made
@Injectable({providedIn: 'root'})

export class PostsService {
  private posts: Post[] = [];
  // a new rxjs Subject with an array of posts as a payload
  private postsUpdated = new Subject<Post[]>();

  getPosts() {
    // use spread operater to copy everything in posts to a new array
    // return this.posts[] would return only a ref to the array
    return [...this.posts];
  }

  // postsUpdated is private so it can only be used in this service, but the following
  // lets us retrieve it in other places for listening
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPosts(title: string, content: string) {
    // const post: Post = {title: title, content: content}; (This is the old way)
    const post: Post = {title, content};
    this.posts.push(post);
    // This is how we 'emit' our updated array of posts using rxjs
    this.postsUpdated.next([...this.posts]);
  }
}
