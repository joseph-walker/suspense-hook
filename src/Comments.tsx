import { Option } from "@swan-io/boxed";
import { useSuspender } from "./createSuspender";

type Props = {
	postId: number;
	numComments: number;
}

type Comment = {
	id: number;
	email: string;
	name: Option<string>;
}

const ILLEGAL_NAMES = [
	"porrot",
	"fugit",
	"id"
]

function takeFirstName(fullName: string): Option<string> {
	const first = fullName.split(" ")[0];

	if (ILLEGAL_NAMES.includes(first)) {
		return Option.None();
	} else {
		return Option.Some(first);
	}
}

export function Comments({ postId, numComments }: Props) {
	const commentsSuspender = useSuspender(
		() => fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
			.then(
				response => response.json()
			)
			.then(
				(rawComments: any[]) => rawComments.map(
					rawComment => ({
						id: rawComment.id,
						email: rawComment.email,
						name: Option.Some(rawComment.name)
					} as Comment)
				)
			)
	);

	const comments = commentsSuspender.read();

	return (
		<ul>
			{comments.slice(0, numComments).map(comment => (
				<li>
					<b>{comment.email}</b>
					<p>{comment.name.flatMap(takeFirstName).getWithDefault("Anonymous")}</p>
				</li>
			))}
		</ul>
	);
}
