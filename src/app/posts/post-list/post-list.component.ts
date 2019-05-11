import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from "@angular/material";

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from "../../auth/auth.service";

@Component({
	selector: 'app-post-list',
	templateUrl: './post-list.component.html',
	styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {

	posts: Post[] = [];
	isLoading = false;
	totalPosts = 0;
	postsPerPage = 10;
	currentPage = 1;
	pageSizeOptions = [1, 2, 5, 10];
	userIsAuthenticated = false;
	userId: string;
	private postsSub: Subscription;
	private authStatusSub: Subscription;



	constructor(public postsService: PostsService, private authService: AuthService) {}

	ngOnInit() {
		this.isLoading = true;
		this.postsService.getPosts(this.postsPerPage, 1);
		this.userId = this.authService.getUserId();
		this.postsSub = this.postsService.getPostUpdateListener()
			.subscribe(( postsData: { posts: Post[], postCount: number } ) => {
				this.isLoading = false;
				this.posts = postsData.posts;
				this.totalPosts = postsData.postCount;
			});
			this.userIsAuthenticated = this.authService.getIsAuth();
			this.authStatusSub = this.authService.
			getAuthStatusListener()
			.subscribe(isAuthenticated => {
				this.userIsAuthenticated = isAuthenticated;
				this.userId = this.authService.getUserId();
			});
	}

	onChangedPage(pageData: PageEvent) {
		this.isLoading = true;
		this.currentPage = pageData.pageIndex + 1;
		this.postsPerPage = pageData.pageSize;
		this.postsService.getPosts(this.postsPerPage, this.currentPage);
	}

	onDelete(postId: string) {
		this.isLoading = true;
		this.postsService.deletePost(postId).subscribe(() => {
			this.postsService.getPosts(this.postsPerPage, this.currentPage);
		});
	}

	ngOnDestroy() {
		this.postsSub.unsubscribe();
		this.authStatusSub.unsubscribe();
	}
}