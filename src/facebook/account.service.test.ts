import { getAccounts } from './account.service';

it('getAccounts', async () => {
    return await getAccounts(322434115609975)
        .then((result) => expect(result).toBeDefined())
        .catch((error) => {
            console.error({ error });
            throw error;
        });
});
