import { IBaseResponse } from '../../../shared/interfaces';

export interface IQuestionResponse extends IBaseResponse {
  data: { answer: string };
}
