import numpy as np
import matplotlib.pyplot as pl
import json
import sys
import os

dataString = ''
for line in sys.stdin:
    dataString += line

data = json.loads(dataString)

class Radar(object):

    def __init__(self, fig, titles, labels, rect=None):
        if rect is None:
            rect = [0.05, 0.05, 0.95, 0.95]

        self.n = len(titles)
        self.angles = np.arange(90, 90+360, 360.0/self.n)
        self.axes = [fig.add_axes(rect, projection='polar', label='axes%d' % i)
                         for i in range(self.n)]

        self.ax = self.axes[0]
        self.ax.set_thetagrids(self.angles, labels=titles, fontsize=20)

        for ax in self.axes[1:]:
            ax.patch.set_visible(False)
            ax.grid('off')
            ax.xaxis.set_visible(False)

        for ax, angle, label in zip(self.axes, self.angles, labels):
            ax.set_rgrids(range(1, 6), angle=angle, labels=label)
            ax.spines['polar'].set_visible(False)
            ax.set_ylim(0, 5)

    def plot(self, values, *args, **kw):
        angle = np.deg2rad(np.r_[self.angles, self.angles[0]])
        values = np.r_[values, values[0]]
        self.ax.plot(angle, values, *args, **kw)


titles = ['Economic Policy', 'Governance', 'Social and Environmental Policy']

labels = [
    list('12345'),
    list('12345'),
    list('12345')
]

for d in data:
    fig = pl.figure(figsize=(13, 8))

    radar = Radar(fig, titles, labels)
    radar.plot(
        [
            float(d['data']['pgc1'] if d['data']['pgc1'] else 0),
            float(d['data']['pgc2'] if d['data']['pgc2'] else 0),
            float(d['data']['pgc3'] if d['data']['pgc3'] else 0),
        ],
        '-',
        lw=2,
        color='#E31E1E',
        label='Donor'
    )
    radar.plot(
        [
            float(d['average']['pgc1'] if d['average']['pgc1'] else 0),
            float(d['average']['pgc2'] if d['average']['pgc2'] else 0),
            float(d['average']['pgc3'] if d['average']['pgc3'] else 0),
        ],
        '-',
        lw=2,
        color='#76b657',
        label='All Other'
    )
    pl.savefig(
        os.path.dirname(os.path.realpath(__file__)) +
        '/../graphics/radar_chart_' + d['donor'] + '.png', bbox_inches='tight')

    pl.close(fig)
