import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Post } from './post.model';

// Injectable is an alt method to listing this service under providers in app.module
// providing at root makes it available everwhere in the app, and only one copy is ever made
@Injectable({providedIn: 'root'})

export class PostsService {
  private posts: Post[] = [];
  // a new rxjs Subject with an array of posts as a payload
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    // use spread operater to copy everything in posts to a new array
    // return this.posts[] would return only a ref to the array
    // return [...this.posts];

    // message gets added on the server side
    this.http.get<{message: string, posts: any }>('http://localhost:3000/api/posts'
      )
      // Purpose of this is to transform the data we get back from the server to match our model
      // specifically removing the underscore in front of id!
      .pipe(map((postData) => { // this map is the rxjs method to apply something to all elements of postData
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          };
        });
      }))
      .subscribe((postData) => {
        this.posts = postData;
        this.postsUpdated.next([...this.posts]);
      });
  }

  // postsUpdated is private so it can only be used in this service, but the following
  // lets us retrieve it in other places for listening
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPosts(title: string, content: string) {
    // const post: Post = {title: title, content: content}; (This is the old way)
    const post: Post = {id: null, title, content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
      .subscribe((responseData) => {
        const id = responseData.postId;
        post.id = id;
        console.log(responseData.message);
        this.posts.push(post);
        // This is how we 'emit' our updated array of posts using rxjs
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/api/posts/' + postId)
      .subscribe(() => {
        // ie the filter includes any post that doesn't have the id sent in by delete poset
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts; // remake the official array
        this.postsUpdated.next([...this.posts]); // send out a copy
      });
  }
}
