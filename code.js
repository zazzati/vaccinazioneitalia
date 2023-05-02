var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

numeral.register('locale', 'it', {
  delimiters: {
    thousands: '.',
    decimal: ','
  }
});
numeral.locale('it');
Highcharts.setOptions({
    lang: {
            shortMonths: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
            weekdays: ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedì', 'Venerdi', 'Sabato'],
            numericSymbols: null,
            thousandsSep: '.'
    },
    rangeSelector : {
        inputEnabled:false,
        selected : 3
    },   
    tooltip: {
      headerFormat: '{point.x: %e %b %Y} <br>'
     },
    plotOptions: {
        series: {
            lineWidth: 2,
            pointWidth: 3
        }
    }
});

var app = new Vue({
  el: '#app',
  data: {
    data: '',
    totpopulation: 51341724,
    startday: '2020-12-27',
    startdayseconddose: '2021-01-16',
    lastupdate: '',
    firstdoseforday: 0,
    firstdose: 0, 
    seconddose: 0,
    totaldose: 0,
    seconddoseforday: 0,
    populationimmunity: 0,
    daysremainingfirstdose: 0,
    daysremainingseconddose: 0,
    datatimeremainingfirstdose: 0,
    datatimeremainingseconddose: 0,
    percpopfirstdose: 0,
    percpopseconddose: 0,
    doses: 0,
  }, mounted() {
            axios.all([axios.get('https://web.archive.org/web/20210127150558/https://raw.githubusercontent.com/italia/covid19-opendata-vaccini/master/dati/anagrafica-vaccini-summary-latest.json'),
              axios.get('https://web.archive.org/web/20210127150558/https://raw.githubusercontent.com/italia/covid19-opendata-vaccini/master/dati/consegne-vaccini-latest.json'),
              axios.get('https://web.archive.org/web/20210127150558/https://raw.githubusercontent.com/italia/covid19-opendata-vaccini/master/dati/last-update-dataset.json'),
              axios.get('https://web.archive.org/web/20210127150558/https://raw.githubusercontent.com/italia/covid19-opendata-vaccini/master/dati/somministrazioni-vaccini-latest.json')
              ])                                                      
        .then(axios.spread((vaccini, consegne, lastupdate,somministrazioni) => {  
            this.buildview(vaccini.data,somministrazioni.data);
            this.buildviewDoses(consegne.data);
            this.buildviewLast(lastupdate.data);
        }))
        .catch(error => console.log(error));
  }
  ,
  methods: {
    buildview: function (data,somministrazioni) {
      data = data.data
      somministrazioni = somministrazioni.data
      this.processData(data,somministrazioni)
    },
    buildviewDoses: function (data) {
      data = data.data
      this.processDataDoses(data)
    },
    buildviewLast: function (data) {
      this.lastupdate = moment(data.ultimo_aggiornamento).format('DD-MM-YYYY hh:mm:ss');           
    },
    processDataDoses: function (data) {
      this.doses = _.sumBy(data, d => {
        return d.numero_dosi;
      });
      this.doses = numeral(this.doses).format();
    },
    processData: function (data,somministrazioni) {
      this.firstdose = _.sumBy(data, d => {
        return d.prima_dose;
      });
      this.seconddose = _.sumBy(data, d => {
        return d.seconda_dose;
      });

      this.totaldose = this.firstdose + this.seconddose;
      var now = dayjs();                              
      var startdate =  dayjs(this.startday, 'YYYY-MM-DD');                    
      var startdayseconddose =  dayjs(this.startdayseconddose, 'YYYY-MM-DD');
      var daysfromstart = now.diff(startdate, "days");          
      var daysfromstartseconddose = now.diff(startdayseconddose, "days");   

      this.firstdoseforday = Math.round(this.firstdose / daysfromstart);
      this.seconddoseforday = Math.round(this.seconddose / daysfromstartseconddose);     
      this.populationimmunity = Math.round(this.totpopulation * 0.7);

      var population_tovaccine_immunity_first = this.populationimmunity - this.firstdose;
      var population_tovaccine_immunity_second = this.populationimmunity - this.seconddose;

      this.daysremainingfirstdose = Math.round(population_tovaccine_immunity_first / this.firstdoseforday);
      this.daysremainingseconddose = Math.round(population_tovaccine_immunity_second / this.seconddoseforday);
      this.datatimeremainingfirstdose = dayjs().add(this.daysremainingfirstdose, 'd').locale('it').format("dddd, D MMMM YYYY");
      this.datatimeremainingseconddose = dayjs().add(this.daysremainingseconddose, 'd').locale('it').format("dddd, D MMMM YYYY");

      this.percpopfirstdose = Math.round(this.firstdose / this.totpopulation * 100 * 100) / 100;
      this.percpopseconddose = Math.round(this.seconddose / this.totpopulation * 100 * 100) / 100;

      this.totpopulation = numeral(this.totpopulation).format();
      this.populationimmunity = numeral(this.populationimmunity).format();
      this.totaldose = numeral(this.totaldose).format();
      this.firstdose = numeral(this.firstdose).format();
      this.seconddose = numeral(this.seconddose).format();
      this.firstdoseforday = numeral(this.firstdoseforday).format();
      this.seconddoseforday = numeral(this.seconddoseforday).format();
      this.daysremainingfirstdose = numeral(this.daysremainingfirstdose).format();
      this.daysremainingseconddose = numeral(this.daysremainingseconddose).format();
     
      this.buildChart(this.percpopfirstdose, 'containeprima');
      this.buildChart(this.percpopseconddose, 'containeseconda');

      var somministrazioni_series =_(somministrazioni).groupBy('data_somministrazione').map((objs, key) => ({
             'data_somministrazione': key,
             'totale': _.sumBy(objs, 'sesso_femminile') + _.sumBy(objs, 'sesso_maschile'),
             'totale_fem': _.sumBy(objs, 'sesso_femminile'),
             'totale_mas': _.sumBy(objs, 'sesso_maschile'),
             'tot_prima_dose': _.sumBy(objs, 'prima_dose'),                                  
             'tot_seconda_dose': _.sumBy(objs, 'seconda_dose'),
             })).value();  
             dataseriestot = [];dataseriesmas = [];dataseriesfem = [];dataseriespri = [];dataseriessec = [];
             _.each(somministrazioni_series, function(item) {                   
                  datesomm = dayjs(item.data_somministrazione);
                  year = datesomm.format('YYYY'); month= datesomm.format('MM'); day= datesomm.format('DD');                      
                  datetimesomm = Date.UTC(year,month-1, day);                        
                  dataseriestot.push([datetimesomm,item.totale]);
                  dataseriesmas.push([datetimesomm,item.totale_mas]);
                  dataseriesfem.push([datetimesomm,item.totale_fem]);
                  dataseriespri.push([datetimesomm,item.tot_prima_dose]);
                  dataseriessec.push([datetimesomm,item.tot_seconda_dose]);
                }
             );
             var dataseries={};
             dataseries.dataseriestot = dataseriestot; 
             dataseries.dataseriesmas = dataseriesmas;
             dataseries.dataseriesfem = dataseriesfem;               
             dataseries.dataseriespri = dataseriespri;               
             dataseries.dataseriessec = dataseriessec;
             
      this.buildChartSomm(dataseries, 'containecomm');
      this.buildChartDose(dataseries, 'containedose');
      
    
    },
    buildChartSomm: function (dataseries,container) {
         Highcharts.chart(container, {
            chart: {
                type: 'area'
            },
            accessibility: {
                description: 'Somministrazione giornaliera vaccini per SARS-CoV-2'
            },
            title: {
                text: 'Somministrazione giornaliera vaccini per SARS-CoV-2. Totale e suddivisione M/F'
            },
            subtitle: {
                text: 'Fonte dati: <a href="https://web.archive.org/web/20210127150558/https://github.com/italia/covid19-opendata-vaccini/blob/master/dati/">' +
                    '2021 (c) Commissario straordinario per l\'emergenza Covid-19 - Presidenza del Consiglio dei Ministri.</a>'
            },
            xAxis: {                    
                type: 'datetime'
                
            },
            yAxis: {
                title: {
                    text: 'Somministrazioni'
                }
            },
            tooltip: {
                pointFormat: '{series.name} somministrazioni <b>{point.y:,.0f}</b>'
            },
            plotOptions: {
                area: {
                    pointStart: 2020,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: [{
                      name: 'Totale',
                      data: dataseries.dataseriestot
                    },
                    {
                      name: 'Femmine',
                      data: dataseries.dataseriesfem
                    },
                    {
                      name: 'Maschi',
                      data: dataseries.dataseriesmas
                    }                      
            ]
        });
       
    },
    buildChartDose: function (dataseries,container) {
         Highcharts.chart(container, {
            chart: {
                type: 'area'
            },
            accessibility: {
                description: 'Somministrazione giornaliera vaccini per SARS-CoV-2. Prima e seconda dose.'
            },
            title: {
                text: 'Somministrazione vaccini per SARS-CoV-2'
            },
            subtitle: {
                text: 'Fonte dati: <a href="https://web.archive.org/web/20210127150558/https://github.com/italia/covid19-opendata-vaccini/blob/master/dati/">' +
                    '2021 (c) Commissario straordinario per l\'emergenza Covid-19 - Presidenza del Consiglio dei Ministri.</a>'
            },
            xAxis: {                    
                type: 'datetime'
                
            },
            yAxis: {
                title: {
                    text: 'Somministrazioni'
                }
            },
            tooltip: {
                pointFormat: '{series.name} somministrazioni <b>{point.y:,.0f}</b>'
            },
            plotOptions: {
                area: {                      
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: [{
                      name: 'Prima Dose',
                      data: dataseries.dataseriespri
                    },
                    {
                      name: 'Seconda Dose',
                      data: dataseries.dataseriessec
                    }
            ]
        });
       
    },
    buildChart: function (perc, container) {
      var chart = new Highcharts.Chart({
        title: {
          text: '',
          align: 'left',
          margin: 0,
        },
        chart: {
          renderTo: container,
          type: 'bar',
          height: 100,
        },
        credits: false,
        tooltip: false,
        legend: false,
        navigation: {
          buttonOptions: {
            enabled: false
          }
        },
        xAxis: {
          visible: false,
        },
        yAxis: {
          visible: false,
          min: 0,
          max: 100,
        },
        series: [{
          data: [100],
          grouping: false,
          animation: false,
          enableMouseTracking: false,
          showInLegend: false,
          color: 'lightskyblue',
          pointWidth: 35,
          borderWidth: 0,
          borderRadiusTopLeft: '4px',
          borderRadiusTopRight: '4px',
          borderRadiusBottomLeft: '4px',
          borderRadiusBottomRight: '4px',
          dataLabels: {
            className: 'highlight',
            format: '100%',
            enabled: true,
            align: 'right',
            style: {
              color: 'black',
              textOutline: false,
            }
          }
        }, {
          enableMouseTracking: false,
          data: [perc],
          borderRadiusBottomLeft: '4px',
          borderRadiusBottomRight: '4px',
          color: 'orange',
          borderWidth: 0,
          pointWidth: 35,
          animation: {
            duration: 250,
          },
          dataLabels: {
            enabled: true,
            inside: true,
            align: 'left',
            format: '{point.y}%',
            style: {
              color: 'black',
              textOutline: false,
            }
          }
        }]
      });
    }
  }
})

}
/*
     FILE ARCHIVED ON 15:05:58 Jan 27, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 15:32:08 Feb 11, 2021.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 1198.933
  exclusion.robots: 0.235
  exclusion.robots.policy: 0.226
  RedisCDXSource: 21.917
  esindex: 0.007
  LoadShardBlock: 1158.983 (3)
  PetaboxLoader3.datanode: 1133.427 (4)
  CDXLines.iter: 15.716 (3)
  load_resource: 79.083
  PetaboxLoader3.resolve: 28.442
*/