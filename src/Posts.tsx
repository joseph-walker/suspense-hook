import { Suspense } from "react";

import { useSuspender } from "./createSuspender";
import { Post } from "./Post";

export type PostEntry = {
	id: number;
}

export function Posts() {
	const todosSuspender = useSuspender(
		() => fetch('https://jsonplaceholder.typicode.com/posts')
			.then(response => response.json() as unknown as PostEntry[])
	);

	const posts = todosSuspender.read();

	return (
		<ul>
			{posts.map(post => (
				<li>
					<Suspense fallback="...">
						<Post postId={post.id} />
					</Suspense>
				</li>
			))}
		</ul>
	)
}
