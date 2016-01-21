from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase.pdfmetrics import stringWidth
import json
import string



# register Open Sans
pdfmetrics.registerFont(TTFont('Open Sans', 'assets/fonts/fonts-open-sans/OpenSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Open Sans Bold', 'assets/fonts/fonts-open-sans/OpenSans-Bold.ttf'))



class RecipientProfile:

    def __init__(self, rec):
        self.rec = rec
        self.c = canvas.Canvas(rec + '.pdf')
        self.PAGEWIDTH, self.PAGEHEIGHT = letter
        
        self.headboxh = 80
    	self.headboxx = 20
    	self.headboxy = 695
    	self.headboxw = 570
    	self.footboxh = 65
    	self.footboxx = 20
    	self.footboxy = 20
    	self.footboxw = 570
    	
        self.style_sheet = getSampleStyleSheet()
        self.style_sheet.add(ParagraphStyle(name='legend',
                               fontName='Open Sans Bold',
                               fontSize=6))
        self.style_sheet.add(ParagraphStyle(name='smalllegend',
                               fontName='Open Sans Bold',
                               fontSize=5))
                               
        # aiddata logo
        self.logouri = "assets/images/aiddata_main_wht.png"

        # chart size constants
        self.chart = {}
        self.chart['pie_width'] = 170
        self.chart['pie_height'] = 170
        self.chart['pie_title_y_offset'] = 170
        self.chart['pie_title_x_offset'] = 40
        self.chart['bars_width'] = 190
        self.chart['bars_height'] = 140
        self.chart['spider_width'] = 350
        self.chart['spider_height'] = 350
        self.chart['double_bar_width'] = 475
        self.chart['double_bar_height'] = 275

        self.debug = False

        self.template().add_charts()

    def template(self):
        self.draw_header()
        return self

    def draw_header(self):
        height_blue = 70
        x_offset_blue = 0
        y_offset_blue = self.PAGEHEIGHT + 50 - height_blue

        # blue header
        self.c.setFillColorRGB(.086, .121, .203)
        self.c.rect(x_offset_blue, y_offset_blue, self.PAGEWIDTH, height_blue, stroke=0, fill=1)
        
        # add logo
        logo = ImageReader(self.logouri)
        self.c.drawImage(logo, 30, 773, 120, 68,preserveAspectRatio=True, mask='auto')

       
        # green header
        height_green = 30
        x_offset_green = 0
        y_offset_green = y_offset_blue - height_green
        self.c.setFillColorRGB(0.46, 0.71, 0.34)
        self.c.rect(x_offset_green, y_offset_green, self.PAGEWIDTH, height_green, stroke=0, fill=1)
        
        self.c.setFillColor(colors.white)
        self.c.setFont('Open Sans', 20)
        self.c.drawString((self.PAGEWIDTH/2)-100, self.PAGEHEIGHT+10 , 'Partner Country Profile')
        
        donor_year = self.rec + " 2015"
        textWidth = stringWidth(donor_year, "Open Sans", 18)
        self.c.setFont('Open Sans', 18)
        self.c.drawString(self.PAGEWIDTH - (textWidth + 25), self.PAGEHEIGHT - 40, donor_year)


        return self

    def add_charts(self):
        self.draw_title()
        self.draw_pie_legend()
        self.draw_dac()
        self.draw_nondac()
        self.draw_multi()
        self.draw_bars()
        self.draw_agenda()
        self.draw_usefulness()
        self.draw_helpfulness()
        self.draw_avg_influence()
        self.draw_perf_note()
        self.draw_footer()

        return self

    def draw_title(self):
        border = 20
        x_offset = border
        y_offset = 700
        x = x_offset
        y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, self.PAGEWIDTH - border * 2, 20)

        title = self.rec.replace('_', ' ') + '\'s Top Development Partners, ODA 2004-2013 (Millions USD)'
        
        
        textWidth = stringWidth(title, "Open Sans", 12)
        self.c.setFont('Open Sans', 12)
        self.c.setFillColor(colors.black)
    	pl = (self.PAGEWIDTH / 2) - (textWidth / 2)
    	self.c.drawString(pl, 705, title)

        return self

    def draw_perf_note(self):

        self.c.setFillColor(colors.black)
        self.c.setFont('Open Sans', 8)
            
        legend = 'Note: The top 3 development partners in each of the 3 aspects of performance that survey respondent evaluated.'
        p = Paragraph(legend, style=self.style_sheet["legend"])
        p.wrapOn(self.c, self.PAGEWIDTH, 100)
        p.drawOn(self.c, 73, 428)
        
        
    def draw_pie_legend(self):
		
        self.c.setFillColor(colors.black)
        self.c.setFont('Open Sans', 8)
            
        legend = '(1) ODA = Official Development Assistance<br/>(2) DAC = Development Assistance Committee<br/>(3) Non-DAC = Non-DAC countries<br/>(4) All USD values are constant to USD-2011'
        p = Paragraph(legend, style=self.style_sheet["legend"])
        p.wrapOn(self.c, 160, 200)
        p.drawOn(self.c, 60, 400)

    def draw_dac(self):
        # location
        x_offset = 50
        y_offset = 490
        title_x = x_offset + self.chart['pie_title_x_offset']
        title_y = y_offset + self.chart['pie_title_y_offset']
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, 200, 200)

        # draw title
        title = 'Top 5 DAC Development Partners'
        p = Paragraph(title, getSampleStyleSheet()['Normal'])
        p.wrapOn(self.c, 100, 100)
        p.drawOn(self.c, title_x, title_y)

        # draw chart
        chart = 'charts/pie_chart_' + self.rec + '_dac.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['pie_width'], self.chart['pie_height'], mask='auto')

        return self

    def draw_nondac(self):
        # location
        x_offset = 350
        y_offset = 490
        title_x = x_offset + self.chart['pie_title_x_offset']
        title_y = y_offset + self.chart['pie_title_y_offset']
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, 200, 200)

        # draw title
        title = 'Top 5 NonDAC Development Partners'
        p = Paragraph(title, getSampleStyleSheet()['Normal'])
        p.wrapOn(self.c, 100, 100)
        p.drawOn(self.c, title_x, title_y)

        chart = 'charts/pie_chart_' + self.rec + '_nondac.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['pie_width'], self.chart['pie_height'], mask='auto')

        return self

    def draw_multi(self):
        # location
        x_offset = self.PAGEWIDTH / 2 - 100
        y_offset = 350
        title_x = x_offset + self.chart['pie_title_x_offset']
        title_y = y_offset + self.chart['pie_title_y_offset']
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, 200, 200)

        # draw title
        title = 'Top 5 MultiLateral Development Partners'
        p = Paragraph(title, getSampleStyleSheet()['Normal'])
        p.wrapOn(self.c, 100, 100)
        p.drawOn(self.c, title_x, title_y)

        # draw chart
        chart = 'charts/pie_chart_' + self.rec + '_multi.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['pie_width'], self.chart['pie_height'], mask='auto')
        return self

    # double bar chart
    def draw_bars(self):
        border = 40
        height = 300
        width = self.PAGEWIDTH - border * 2
        x_offset = border+15
        y_offset = self.PAGEHEIGHT - 775
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, width, height)
        
        title = 'Aspects of Development Partner Performance by Most Influenced Policy Domains'
        
        
        textWidth = stringWidth(title, "Open Sans", 12)
        self.c.setFont('Open Sans', 12)
        self.c.setFillColor(colors.black)
    	pl = (self.PAGEWIDTH / 2) - (textWidth / 2)
    	self.c.drawString(pl, 315, title)

        #draw chart
        chart = 'charts/double_bar_chart_' + self.rec + '.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['double_bar_width'], self.chart['double_bar_height'], mask='auto')
		
        legend1 = 'Usefulness of Policy Advice (1-5)'
        p = Paragraph(legend1, style=self.style_sheet["smalllegend"])
        p.wrapOn(self.c, self.PAGEWIDTH, 100)
        p.drawOn(self.c, 125, 287)
        
        legend1 = 'Helpfulness in Implementation (0-5)'
        p = Paragraph(legend1, style=self.style_sheet["smalllegend"])
        p.wrapOn(self.c, self.PAGEWIDTH, 100)
        p.drawOn(self.c, 375, 287)
        
        note = '*Domain-specfic ODA refers to amount of ODA committed to each policy domain.'
        p = Paragraph(note, style=self.style_sheet["smalllegend"])
        p.wrapOn(self.c, self.PAGEWIDTH, 100)
        p.drawOn(self.c, 73, 10)
        return self

    def draw_agenda(self):
        self.c.showPage()

        x_offset = self.PAGEWIDTH /2 - 100
        y_offset = 650
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, 200, 160)

        # draw chart
        chart = 'charts/bar_chart_' + self.rec + '_agenda.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['bars_width'], self.chart['bars_height'], mask='auto')

        title = 'Agenda-Setting Influence'
        
        textWidth = stringWidth(title, "Open Sans", 12)
        self.c.setFont('Open Sans', 12)
        self.c.setFillColor(colors.black)
    	pl = (self.PAGEWIDTH / 2) - (textWidth / 2)
    	self.c.drawString(pl, self.PAGEHEIGHT+10, title)
        return self

    def draw_usefulness(self):
        x_offset = 70
        y_offset = 450
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, 200, 160)

        # draw chart
        chart = 'charts/bar_chart_' + self.rec + '_use.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['bars_width'], self.chart['bars_height'], mask='auto')

        title = 'Usefulness of Policy Advice'
    
        self.c.setFont('Open Sans', 12)
        self.c.setFillColor(colors.black)
    	pl = 83
    	self.c.drawString(pl, 600, title)
        return self

    def draw_helpfulness(self):
        x_offset = 330
        y_offset = 450
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, 200, 160)

        # draw chart
        chart = 'charts/bar_chart_' + self.rec + '_help.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['bars_width'], self.chart['bars_height'], mask='auto')
        
        title = 'Helpfulness in Implementation'
    
        self.c.setFont('Open Sans', 12)
        self.c.setFillColor(colors.black)
    	pl = 340
    	self.c.drawString(pl, 600, title)
        return self
        return self

    # spider chart
    def draw_avg_influence(self):
        border_x = 125
        width = self.PAGEWIDTH - border_x * 2
        x_offset = border_x
        y_offset = 40
        chart_x = x_offset
        chart_y = y_offset

        if self.debug:
            self.c.rect(x_offset, y_offset, width, 330)

        chart = 'charts/spider_chart_' + self.rec + '.png'
        self.c.drawImage(chart, chart_x, chart_y, \
                self.chart['spider_width'], self.chart['spider_height'], mask='auto')
        
         
        title = 'Average Development Partner Influence at the Agenda-Setting Stage'
             
        textWidth = stringWidth(title, "Open Sans", 12)
        self.c.setFont('Open Sans', 12)
        self.c.setFillColor(colors.black)
    	pl = (self.PAGEWIDTH / 2) - (textWidth / 2)
    	self.c.drawString(pl, 360, title)

        return self

    def draw_footer(self):
        logo = ImageReader('assets/images/aiddata_main_wht.png')
        x_offset = 0
        y_offset = 0
        width = self.PAGEWIDTH
        height = 70

        self.c.setFillColorRGB(.086, .121, .203)
        self.c.rect(x_offset, y_offset, width, height, fill=1)

        logo_x = x_offset + 450
        logo_y = y_offset
        self.c.drawImage(logo, logo_x, logo_y, 120, 68, preserveAspectRatio=True, mask='auto')
        
        style = getSampleStyleSheet()['Normal']
        style.leading = 7
        
        datastr1 = "<font color='white' fontName='Open Sans' size=7><b>Perceptions Data Availibility</b><br/></font> \
        <font color='white' fontName='Open Sans' size=6>Source: 2014 Reform Efforts Survey<br/> \
        Number of Policy Domains:20<br/> \
        Number of Respondents:<br/> \
        1. Embasssies: 84<br/> \
        2. GIZ: 36<br/> \
        3. KfW: 19<br/></font>"
         
        datastr2 = "<font color='white' fontName='Open Sans' size=7><b>Financial Data Availability</b><br/></font> \
        <font color='white' fontName='Open Sans' size=6>Source: AidData Core Database, 2004-2013<br/> \
        Number of Recipients:12<br/> \
        Total Projects: 245<br/> \
        Total Commitments (USD 2011): $21.3 million<br/></font>"
    
    	pData1 = Paragraph(datastr1, style)
        pData1.wrapOn(self.c, 150, 400)
        pData1.drawOn(self.c, 25, 10)
        
        pData2 = Paragraph(datastr2, style)
        pData2.wrapOn(self.c, 150, 400)
        pData2.drawOn(self.c, 180, 25)

        return self

    def save(self):
        self.c.save()

        return self

if __name__ == '__main__':
    with open('scripts/parsed_data/data.json') as data_file:    
        data = json.load(data_file)
        for i in data:
            p = RecipientProfile(string.replace(i["orgname"]," ","_"))
            p.save()
    #for rec in ['Thailand']:
     #   p = RecipientProfile(rec)
     #   p.save()
