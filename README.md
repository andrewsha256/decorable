# Decorable

> Work in Progress

A set of TypeScript lightweight (zero none-dev-dependencies) decorators for automated logging, monitoring, and other auxiliary tasks, allowing for the separation of business logic and maintenance concerns.

## @Loggable

Wraps class method and logs input, output, error.

## @Monitorable

Wraps method and sends data to provided metric consumer.

## Utils

### Timeoutable

`timeoutable` facilitates code reuse across Node.js and browser environments by abstracting away the differences in their respective return type behaviors (`NodeJs.Timeout` vs `number`).

### Deferrable

Defers function execution and returns related `TimeoutId`.

### Stringify

Serializes object to string.

## Example

```typescript
import { Loggable } from './loggable';
import { Monitorable } from './monitorable';

class TestClass {
    @Monitorable({
        consume: console.log,
        consumeBefore: console.log,
    })
    @Loggable()
    test() {
        console.log('test');
    }

    @Loggable()
    @Monitorable({
        consume: console.log,
        consumeBefore: console.log,
    })
    error() {
        throw new Error('error');
    }
}

const instance = new TestClass();

instance.test();
instance.error();
```

### Requirements

**tsconfig.json**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```
