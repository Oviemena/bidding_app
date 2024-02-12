import { usernamesUniqueKey, usersKey, usernamesKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [keys: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
export const getUserByUsername = async (username: string) => {
	const decimalId = await client.zScore(usernamesKey(), username);
	if (!decimalId) throw new Error('User does not exists!');
	const id = decimalId.toString(16);
	const user = await client.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();
	const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);

	if (exists) throw new Error('Username is taken!');
	await client.hSet(usersKey(id), serialize(attrs));
	await client.sAdd(usernamesUniqueKey(), attrs.username);
	await client.zAdd(usernamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16),
	});
	return id;
};
