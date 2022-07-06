import { Suspense } from "react";

import { Suspensions } from "../src/createSuspender";
import { Posts } from "../src/Posts";

export default function Application() {
	return (
		<Suspensions.Provider value={new Map()}>
			<h1>App</h1>
			<Suspense fallback="...">
				<Posts />
			</Suspense>
		</Suspensions.Provider>
	);
}
