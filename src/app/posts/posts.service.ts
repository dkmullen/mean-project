import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';

// Injectable is an alt method to listing this service under providers in app.module
// providing at root makes it available everwhere in the app, and only one copy is ever made
@Injectable({providedIn: 'root'})

export class PostsService {
  private posts: Post[] = [];
  // a new rxjs Subject with an array of posts as a payload
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    // use spread operater to copy everything in posts to a new array
    // return this.posts[] would return only a ref to the array
    // return [...this.posts];

    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    // message gets added on the server side
    this.http.get<{message: string, posts: any, maxPosts: number }>('http://localhost:3000/api/posts' + queryParams
      )
      // Purpose of this is to transform the data we get back from the server to match our model
      // specifically removing the underscore in front of id!
      .pipe(map((postData) => { // this map is the rxjs method to apply something to all elements of postData
        return {posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }),
        maxPosts: postData.maxPosts
      };
      }))
      .subscribe((transformedPostData) => {
        console.log(transformedPostData)
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
      });
  }

  // postsUpdated is private so it can only be used in this service, but the following
  // lets us retrieve it in other places for listening
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    // const post: Post = {title: title, content: content}; (This is the old way)
    // const post: Post = {id: null, title, content};
    const postData = new FormData(); // fd is js object allowing us to combine data and blobs
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title); // sending this to const storage in posts.js, must match what we ask for there
    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string ) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id, title, content, imagePath: image, creator: null };
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postId);
  }
}
