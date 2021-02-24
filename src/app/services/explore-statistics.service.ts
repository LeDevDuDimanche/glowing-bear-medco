import { Injectable } from "@angular/core";
import { ApiExploreStatistics } from "app/models/api-request-models/survival-analyis/api-explore-statistics";
import { Concept } from "app/models/constraint-models/concept";
import { ErrorHelper } from "app/utilities/error-helper";
import { forkJoin, Observable } from "rxjs";
import { timeout } from "rxjs/operators";
import { ApiEndpointService } from "./api-endpoint.service";
import { MedcoNetworkService } from "./api/medco-network.service";
import { CohortService } from "./cohort.service";
import { CryptoService } from "./crypto.service";

@Injectable()
export class ExploreStatisticsService {
    constructor(
        private apiEndpointService: ApiEndpointService,
        private cryptoService: CryptoService,
        private cohortService: CohortService,
        private medcoNetworkService: MedcoNetworkService
    ) { }

    //1 minute timeout
    private static TIMEOUT_MS = 1000 * 60 * 1;

    private static getNewQueryID(): string {
        let d = new Date()
        return (`Explore_Statistics${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}` +
            `${d.getUTCMinutes()}${d.getUTCSeconds()}${d.getUTCMilliseconds()}`)
    }

    executeQuery(concept: Concept, numberOfBuckets: number) {
        if (!this.cohortService.selectedCohort || !this.cohortService.selectedCohort.name) {
            throw ErrorHelper.handleNewError('Please select a cohort on the left located cohort selection menu.')
        }

        const apiRequest: ApiExploreStatistics = {
            ID: ExploreStatisticsService.getNewQueryID(),
            numberOfBuckets,
            concept: concept.path,
            cohortName: this.cohortService.selectedCohort.name,
            userPublicKey: this.cryptoService.ephemeralPublicKey
        }

        if (concept.modifier) {
            apiRequest.modifier = {
                ModifierKey: concept.modifier.path,
                AppliedPath: concept.modifier.appliedPath
            }
        }

        forkJoin(this.medcoNetworkService.nodes.map(
            node =>
                this.apiEndpointService.postCall(
                    'node/explore-statistics/query',
                    apiRequest,
                    node.url
                )
        ))
        .pipe(timeout(ExploreStatisticsService.TIMEOUT_MS))
        .subscribe(results => {
            console.log("Explore statistics request results ", results)
        })


    }

}