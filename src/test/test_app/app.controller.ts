import {Controller, Logger} from '@nestjs/common';
import {MessagePattern, EventPattern, Ctx, Payload} from '@nestjs/microservices';
import {Observable, from} from 'rxjs';
import {Chance} from 'chance'
import {GcpPubSubContext} from '../../ctx-host';

interface User {
  id: string,
  name: string,
  email: string
}

const chance = new Chance();

let counter = 0

const SUB = 'reqres-request-sub';

@Controller()
export class AppController {
  logger = new Logger('AppController');

  /**
   * Register a message handler for test subscription
   */
  @MessagePattern(SUB)
  async register(@Payload() data: unknown, @Ctx() ctx: GcpPubSubContext): Promise<any> {
    counter++;
    const userData = data as User
    const {id} = ctx.getMessage()
    this.logger.log(`Processing Message number ${counter}`);
    return ({userID: userData.id, name: userData.name, email: userData.email, status: 'registered', commitID: chance.hash()})
  }

  // ### OLD EXAMPLES
  //  /**
  //   * Register an event handler for 'add-customer' events
  //   */
  //  @EventPattern('/add-customer')
  //  addCustomer(customer: Customer) {
  //    customerList.push({
  //      id: lastId + 1,
  //      name: customer.name,
  //    });
  //    lastId++;
  //    this.logger.log(`Customer list:\n${JSON.stringify(customerList, null, 2)}`);
  //  }
  //
  //  /*====================================================
  //    Following are handlers for our Observable deep dive
  //  =====================================================*/
  //
  //  /**
  //   * Return a promise that resolves when our 3 step job is complete
  //   *
  //   * @param duration number of seconds that a base task takes
  //   */
  //
  //  @MessagePattern('/jobs-promise')
  //  doPromiseWork(duration): Promise<any> {
  //    return this.workService.doThreeSteps(duration);
  //  }
  //
  //  /**
  //   * Convert the promise to an observable
  //   *
  //   * @param duration base duration unit for each job
  //   */
  //  @MessagePattern('/jobs-observable')
  //  doObservableWork(duration): Observable<any> {
  //    return from(this.workService.doThreeSteps(duration));
  //  }
  //
  //  /**
  //   * Emit interim status results at the completion of each job
  //   *
  //   * @param duration base duration unit for each job
  //   */
  //  @MessagePattern('/jobs-stream1')
  //  doStream1(duration): Observable<any> {
  //    return new Observable(observer => {
  //      // build array of promises to run jobs #1, #2, #3
  //      const jobs = [1, 2, 3].map(job => this.workService.doStep(job, duration));
  //
  //      // run the promises in series
  //      Promise.mapSeries(jobs, jobResult => {
  //        // promise has resolved (job has completed)
  //        observer.next(jobResult);
  //      }).then(() => observer.complete());
  //    });
  //  }
  //  /**
  //   * Emit interim status results at the completion of each job, and
  //   * a final result upon completion of all jobs
  //   *
  //   * @param duration base duration unit for each job
  //   */
  //  @MessagePattern('/jobs-stream2')
  //  doStream2(duration): Observable<any> {
  //    return new Observable(observer => {
  //      // build array of promises to run jobs #1, #2, #3
  //      const jobs = [1, 2, 3].map(job => this.workService.doStep(job, duration));
  //
  //      // run the promises in series
  //      Promise.mapSeries(jobs, jobResult => {
  //        // promise has resolved (job has completed)
  //        observer.next(jobResult);
  //        return jobResult;
  //      }).then(results => {
  //        // all promises (jobs) have resolved
  //        //
  //        // generate final result
  //        const finalResult = results.reduce(
  //          (acc, val) => {
  //            return {
  //              jobCount: acc.jobCount + 1,
  //              totalWorkTime: acc.totalWorkTime + val.workTime,
  //            };
  //          },
  //          { jobCount: 0, totalWorkTime: 0 },
  //        );
  //        // send final result and complete the observable
  //        observer.next(finalResult);
  //        observer.complete();
  //      });
  //    });
  //  }
  //
  //  /*
  //    Following is the handler for Part 4, testing multiple outstanding
  //    requests
  //  */
  //  @MessagePattern('/race')
  //  async race(data: any): Promise<any> {
  //    this.logger.log(`Got '/race' with ${JSON.stringify(data)}`);
  //
  //    const delay = (data.requestDelay && data.requestDelay * 1000) || 0;
  //    const cid = (data.requestId && data.requestId) || 0;
  //
  //    const customers = [{ id: 1, name: 'fake' }];
  //
  //    function sleep() {
  //      return new Promise((resolve, reject) => {
  //        setTimeout(() => {
  //          resolve();
  //        }, delay);
  //      });
  //    }
  //
  //    await sleep();
  //    return { customers, cid, delay };
  //  }
}

