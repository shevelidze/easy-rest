# Easyrest

<a href="https://www.npmjs.com/package/@shevelidze/easyrest"><img src="https://img.shields.io/npm/v/@shevelidze/easyrest" alt="npm"></a>
<img src="https://img.shields.io/github/license/shevelidze/easyrest" alt="license"></img>

Easyrest is a typescript library for building RESTful APIs without repeating yourself. It takes care about all aspects that cause a headache in a RESTful API developing process.

Easyrest offers:
1. Simple entities architecture, which allows to design your api using small amount of code.
2. Opportunity to use it with any possible web framework. It doesn't have any framework specific features or something similar.
3. Opportunity to use different approaches to fetch data. For an every entity you have to provide a fetcher, mutator, and deleter functions. You decide how it will work inside.

## Getting started

```
npm install @shevelidze/easyrest
```
or
```
yarn add  @shevelidze/easyrest
```

First of all you have to decide with the entities, which you will have in the api and develop fetcher for each. You can find out more about the fetchers in the [Fetchers](#fetchers) section.

Now, you can create an instance of EasyRest with entitity blueprints. [Entity blueprint](#entity-blueprint) is a set of entitity members, methods and data manipulation functions.

```ts
import EasyRest from '@shevelidze/easyrest';

// add fetchers definitions here

const easyRest = new EasyRest.Instance({
  zoo: {
    members: {
      address: EasyRest.string(),
      workers: EasyRest.array(EasyRest.entity('worker')),
      animals: EasyRest.array(EasyRest.entity('animal')),
    },
    fetcher: zooFetcher,
  },
  worker: {
    members: {
      name: EasyRest.string(),
      birthDate: EasyRest.string(),
      salary: EasyRest.number(),
    }
    fetcher: workerFetcher,
  },
  animal: {
    members: {
      name: EasyRest.string(),
      type: EasyRest.entity('entimal_type')
    },
    fetcher: animalFetcher,
  },
  animal_type: {
    members: {
      name: EasyRest.string()
    },
    fetcher: animalTypeFetcher,
  }
});
```

For processing queries, EasyRest.Instance has a method [processQuery](#process-query). It take as arguments, query array (for request with a path `/foo/bar/1`, for example, it will be `['foo', 'bar', '1']`), HTTP method and body object. The easiest way, use JSON for body and than just convert it to an object, but you are free to use any other way.

When you get a request you have to call this method.

```ts
const apiResult = await easyRest.processQuery(queryArray, httpMethod, bodyObject);
```

If the request is invalid, this method will throw an instance of [EasyRest.errors.EasyRestError](#easyrest-error), which will contain a HTTP code of the error and a message.

If not, it will return an instance of [EasyRest.ApiResult](#api-result), which contains a HTTP code and body for the response.

**After all theese manipulations you can:**

- get all the object of the entity: `GET /entities/worker` &rarr; `[{id: "1", name: "John"... }, {id: "2", name: "Victor"...}]`
- get an object by id: `GET /entities/animal/12` &rarr; `{id: "12", name: "Lucky", type: {id: "2", name: "Dog"}}`
- get only one member of the object: `GET /entities/animal/12/type` &rarr; `{id: 2, name: "Dog"}`