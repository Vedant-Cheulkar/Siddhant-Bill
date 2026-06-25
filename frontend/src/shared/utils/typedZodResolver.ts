import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';

/** Bridges Zod 4 schemas with @hookform/resolvers under strict TypeScript. */
export function typedZodResolver<T extends FieldValues>(schema: unknown): Resolver<T> {
  return zodResolver(schema as never) as unknown as Resolver<T>;
}
