import { createContext, useContext, useId } from "react";

export const Suspensions = createContext(new Map());

type Suspender<T, A extends readonly unknown[]> = {
	read: (...args: A) => T
}

export type Fetcher<T, A extends readonly unknown[]> = (...args: A) => Promise<T>;

enum SuspenderState {
	UNREQUESTED = 0,
	PENDING = 1,
	ERROR = 2,
	COMPLETE = 3
};

export function suspenderFactory<T, A extends readonly unknown[]>(
	suspensions: Map<string, Suspender<T, A>>, 
	id: string, 
	fetcher: Fetcher<T, A>
): Suspender<T, A> {
	if (suspensions.has(id)) {
		return suspensions.get(id);
	} else {
		const s = createSuspender<T, A>(fetcher);
		suspensions.set(id, s);
		return s;
	}
}

export function createSuspender<T, A extends readonly unknown[]>(fetcher: (...args: A) => Promise<T>): Suspender<T, A> {
	let data: T;
	let error: unknown;
	let state: SuspenderState = SuspenderState.UNREQUESTED;
	let suspender: Promise<void>;

	return {
		read: function (...args: A) {
			switch(state) {
				case SuspenderState.UNREQUESTED:
					state = SuspenderState.PENDING;

					suspender = new Promise(async function (resolveSuspender) {
						try {
							data = await fetcher(...args);
							state = SuspenderState.COMPLETE;

							resolveSuspender();
						} catch (e) {
							error = e;
							state = SuspenderState.ERROR;
						}
					});

					throw suspender;
				case SuspenderState.PENDING:
					throw suspender;
				case SuspenderState.ERROR:
					throw error;
				case SuspenderState.COMPLETE:
					return data;
			}
		}
	}
}

export function useSuspender<T, A extends readonly unknown[]>(fetcher: Fetcher<T, A>) {
	const id = useId();
	const suspensions = useContext(Suspensions);

	return suspenderFactory(suspensions, id, fetcher);
}
