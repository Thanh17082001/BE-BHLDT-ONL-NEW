import { v4 as uuidv4 } from 'uuid';
import { safeName } from './generate-username';

export const randomNameFile = (name: string) => `${uuidv4()}_${safeName(name)}`;
export const randomNameFileVideo = (name: string) => `${uuidv4()}_${(name)}`;