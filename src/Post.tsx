import { Suspense } from "react";
import { Option } from "@swan-io/boxed";

import { Comments } from "./Comments";
import { useSuspender } from "./createSuspender";

type Props = {
	postId: number;
}

type Post = {
	id: number;
	title: Option<string>;
	body: Option<string>;
	comments: Option<number>;
}

const createCommentsSection = (postId: number) => (numComments: number) => {
	return (
		<>
			<em>{numComments} comments:</em>
			<Suspense fallback="...">
				<Comments postId={postId} numComments={numComments} />
			</Suspense>
		</>
	)
}

export function Post({ postId }: Props) {
	const postSuspender = useSuspender(
		() => fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
			.then(response => response.json())
			.then(rawPost => ({
				id: rawPost.id,
				title: rawPost.id % 3 !== 0 ? Option.fromNullable(rawPost.title) : Option.None(),
				body: rawPost.id % 4 !== 0 ? Option.fromNullable(rawPost.body) : Option.None(),
				comments: rawPost.id % 2 === 0 ? Option.None() : Option.Some(Math.ceil(rawPost.id / 2))
			} as Post))
	);

	const post = postSuspender.read();

	return (
		<div>
			<h4><small>{postId}:</small>&nbsp;{post.title.map(s => s.toUpperCase()).getWithDefault("Untitled")}</h4>
			<p>{post.body.getWithDefault("No content")}</p>
			{
				post
					.comments
					.map(createCommentsSection(post.id))
					.getWithDefault(<em>No comments</em>)
			}
		</div>
	);
}
