import { useSuspender } from "./createSuspender";

type Props = {
	postId: number;
}

type Post = {
	id: number;
	title: string;
}

export function Post({ postId }: Props) {
	const postSuspender = useSuspender(
		() => fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
			.then(response => response.json() as unknown as Post)
	);

	const post: any = postSuspender.read();

	return (
		<p>{postId}: {post.title}</p>
	);
}
