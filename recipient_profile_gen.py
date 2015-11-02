from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

# register Open Sans
pdfmetrics.registerFont(TTFont('Open Sans', 'assets/fonts/fonts-open-sans/OpenSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Open Sans Bold', 'assets/fonts/fonts-open-sans/OpenSans-Bold.ttf'))

class RecipientProfile():

    def __init__(self, rec):
        self.rec = rec
        self.c = canvas.Canvas(rec + '.pdf')
        self.PAGEWIDTH, self.PAGEHEIGHT = letter
        self.template().add_charts()

    def template():
        self.draw_header().draw_footer()
        return self

    def draw_header():
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
        self.c.drawString(headboxx + 160, headboxy + .425 * headboxh, 'Recipient Profile')
        return self

    def draw_footer():
        logouri = 'assets/images/aiddata_main_wht.png'
        logo = ImageReader(logouri)
        self.c.drawImage(logo, 475, 18, 120, 68, preserveAspectRatio=True, mask='auto')
        return self

    def add_charts():
        self.draw_dac()
        self.draw_nondac()
        self.draw_multi()
        return self

    def draw_dac():
        chart = 'charts/pie_chart_' + self.rec + '_dac.png'
        self.c.drawImage(chart, 100, 100, 150, 200, mask='auto')
        return self

    def draw_nondac():
        chart = 'charts/pie_chart_' + self.rec + '_nondac.png'
        self.c.drawImage(chart, 200, 200, 150, 200, mask='auto')
        return self

    def draw_multi():
        chart = 'charts/pie_chart_' + self.rec + '_multi.png'
        self.c.drawImage(chart, 300, 300, 150, 200, mask='auto')
        return self

    def save():
        this.c.save()
        return self

if __name__ == '__main__':
    for rec in ['Afghanistan']:
        p = RecipientProfile(rec)
        p.save()
