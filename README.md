# Easyrest

<a href="https://www.npmjs.com/package/@shevelidze/easyrest"><img src="https://img.shields.io/npm/v/@shevelidze/easyrest" alt="npm"></a>
<img src="https://img.shields.io/github/license/shevelidze/easyrest" alt="github"></img>

Easyrest is a typescript library for building RESTful APIs without repeating yourself. It takes care about all aspects that cause a headache in a RESTful API developing process.

Easyrest offers:
1. Simple entities architecture, which allows to design your api using small amount of code.
2. Ability to use it with any possible web framework. It doesn't have any framework specific features or something similar.
3. Ability to use different approaches to fetch data. For an every entity you should provide a fetcher, mutator, and deleter functions. You decide by yourself how it will work inside.

## Getting started

```
npm install @shevelidze/easyrest
```
or
```
yarn add  @shevelidze/easyrest
```

Firstly you have to create an instance of EasyRest with entitity blueprints. Entity blueprint is a set of entitity members, methods and data manipulation functions.

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
  }
  animal: {
    members: {
      name: EasyRest.string(),
      type: EasyRest.entity('entimal_type')
    },
    fetcher: animalFetcher,
  }
  animal_type: {
    members: {
      name: EasyRest.string()
    },
    fetcher: animalTypeFetcher,
  }
});
```