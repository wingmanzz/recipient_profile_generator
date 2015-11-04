from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

# register Open Sans
pdfmetrics.registerFont(TTFont('Open Sans', 'assets/fonts/fonts-open-sans/OpenSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Open Sans Bold', 'assets/fonts/fonts-open-sans/OpenSans-Bold.ttf'))

class RecipientProfile:

    def __init__(self, rec):
        self.rec = rec
        self.c = canvas.Canvas(rec + '.pdf')
        self.PAGEWIDTH, self.PAGEHEIGHT = letter
        self.template().add_charts()

    def template(self):
        self.draw_header().draw_footer()
        return self

    def draw_header(self):
        headboxh = 80
        headboxx = 20
        headboxy = 695
        headboxw = 570

        # blue header
        self.c.setFillColorRGB(.086, .121, .203)
        self.c.rect(headboxx, headboxy, headboxw, headboxh, fill=1)
        self.c.saveState()
        self.c.setFillColor(colors.white)
        self.c.setFont('Open Sans', 20)
        self.c.drawString(headboxx, headboxy + .425 * headboxh, 'Recipient Profile')
        return self

    def draw_footer(self):
        logouri = 'assets/images/aiddata_main_wht.png'
        logo = ImageReader(logouri)
        self.c.drawImage(logo, 475, 18, 120, 68, preserveAspectRatio=True, mask='auto')
        return self

    def add_charts(self):
        self.draw_dac()
        self.draw_nondac()
        self.draw_multi()
        return self

    def draw_dac(self):
        # location
        x_offset = 100
        y_offset = self.PAGEHEIGHT - 150
        title_x = x_offset + 0
        title_y = y_offset + 0
        chart_x = x_offset + 10
        chart_y = y_offset

        # draw title
        title = 'Top 5 DAC Development Partners'
        p = Paragraph(title, getSampleStyleSheet()['Normal'])
        p.wrapOn(self.c, 100, 100)
        p.drawOn(self.c, title_x, title_y)

        # draw chart
        chart = 'charts/pie_chart_' + self.rec + '_dac.png'
        self.c.drawImage(chart, chart_x, chart_y, 400, 200, mask='auto')
        return self

    def draw_nondac(self):
        # location
        x_offset = 0
        y_offset = 0
        title_x = x_offset + 0
        title_y = x_offset + 0
        chart_x = x_offset + 0
        chart_y = y_offset + self.PAGEHEIGHT - 300

        title = 'Top 5 NonDAC Development Partners'
        chart = 'charts/pie_chart_' + self.rec + '_nondac.png'
        #self.c.drawImage(chart, chart_x, chart_y, 400, 200, mask='auto')
        return self

    def draw_multi(self):
        # location
        x_offset = 0
        y_offset = 0
        title_x = x_offset + 0
        title_y = x_offset + 0
        chart_x = 100
        chart_y = self.PAGEHEIGHT - 500

        title = 'Top 5 MultiLateral Development Partners'
        chart = 'charts/pie_chart_' + self.rec + '_multi.png'
        self.c.drawImage(chart, chart_x, chart_y, 400, 200, mask='auto')
        return self

    def save(self):
        self.c.save()
        return self

if __name__ == '__main__':
    for rec in ['Afghanistan']:
        p = RecipientProfile(rec)
        p.save()
