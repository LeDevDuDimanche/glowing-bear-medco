/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, ElementRef, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChartInformation, ExploreStatisticsService } from 'app/services/explore-statistics.service';
import Chart from 'chart.js';

@Component({
  selector: 'gb-explore-statistics-results',
  templateUrl: './gb-explore-statistics-results.component.html',
  styleUrls: ['./gb-explore-statistics-results.component.css'],
})

export class GbExploreStatisticsResultsComponent implements OnInit, OnChanges {

  @ViewChild('exploreStatsChartElement', { static: true }) histogramElement: ElementRef;


  //TODO create a getter and a setter?
  chart: Chart;

  chartInfoReceivedAtLeastOnce: boolean = false

  constructor(exploreStatisticsService: ExploreStatisticsService) {

    exploreStatisticsService.ChartDataEmitter.subscribe((chartInfo: ChartInformation) => {
      console.log(chartInfo.intervals)
      this.updateChart(chartInfo)
    })

  }

  private static BACKGROUND_COLOURS: string[] = ['rgba(255, 99, 132, 0.5)',
    'rgba(54, 162, 235, 0.5)',
    'rgba(255, 206, 86, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(153, 102, 255, 0.5)',
    'rgba(255, 159, 64, 0.5)']

  private static getBackgroundColor(index: number): string {
    return GbExploreStatisticsResultsComponent.BACKGROUND_COLOURS[index % GbExploreStatisticsResultsComponent.BACKGROUND_COLOURS.length]
  }

  private updateChart(chartInfo: ChartInformation) {
    if (chartInfo && chartInfo.intervals && chartInfo.intervals.length > 0) {
      this.chart.data.labels = chartInfo.intervals.map(i => "[" + i.lowerBound + ", " + i.higherBound + "]");
      this.chart.data.datasets[0].data = chartInfo.intervals.map(i => i.count);
      this.chart.data.datasets[0].backgroundColor = chartInfo.intervals.map((_, index) => GbExploreStatisticsResultsComponent.getBackgroundColor(index))

      var min, max: number
      max = chartInfo.intervals[0].count
      min = max

      chartInfo.intervals.forEach(v => {
        if (max < v.count) {
          max = v.count
        }
        if (min > v.count) {
          min = v.count
        }
      })

      const minDisplayed = min - (max - min) * .1
      this.chart.options.scales.yAxes = [{
        ticks: {
          min: minDisplayed //Should I define the minimum differently?
        }
      }]

    } else {
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
    }

    this.chartInfoReceivedAtLeastOnce = true
    this.chart.update();
  }

  ngOnInit(): void {
    //initialize the chart
    //TODO update the name of the chart depending on the  concept dropped.
    this.chart = new Chart(this.histogramElement.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of observations',
          data: []
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        }
      }
    });
  }

  //TODO Check how this is used in other components.
  ngOnChanges(changes: SimpleChanges): void {
  }


}
