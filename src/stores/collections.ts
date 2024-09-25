import { batch, observable } from "@legendapp/state";
import type { Collection } from "@linkvite/js";

export const collectionStore = observable({
	data: [] as Collection[],
	data_keyExtractor: (item: Collection) => item.id,
});

/**
 * Load the collections into the store.
 *
 * @param {Collection[]} c - The collections to load.
 */
function initialize(c: Collection[]) {
	batch(() => {
		collectionStore.data.set(c);
	});
}

/**
 * Add a collection to the store.
 *
 * @param {Collection} c - The collection to add.
 */
function add(c: Collection) {
	const store = collectionStore.data.get();
	if (store.find((item) => item.id === c.id)) {
		return;
	}
	collectionStore.data.set([c, ...collectionStore.data.get()]);
}

export const collectionActions = {
	add,
	initialize,
};
