// Navbar Start
const listBtn = document.getElementById('listBtn');
const listBtnTop = document.getElementById('listBtnTop');
const listBtnCenter = document.getElementById('listBtnCenter');
const listBtnBottom = document.getElementById('listBtnBottom');
const navbarMenu = document.querySelector('.navbar-active');

listBtn.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    listBtnTop.classList.toggle('active');
    listBtnCenter.classList.toggle('active');
    listBtnBottom.classList.toggle('active');
});
// Navbar End

// Scroll Animation Start
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("text-primary");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("text-primary");
    }
  });
});
// Scroll Animation End

// Service Start
const choosePage = document.getElementById("choosePage");
const chooseShow = document.getElementById("chooseShow");
const chooseHide = document.getElementById("chooseHide");

choosePage.style.display = "none";
chooseShow.addEventListener('click', () => {
  choosePage.style.display = "block";
});

chooseHide.addEventListener('click', () => {
  choosePage.style.display = "none";
});
// Service End

// Statistic Start
function isMobileOrTablet() {
    const w = window.innerWidth
    return w <= 1024
}

class StackedBarChart {
    constructor(canvasId, data) {
        this.canvas = document.getElementById(canvasId)
        if (isMobileOrTablet()) {
            this.canvas.height = 1000
        } else {
            this.canvas.height = 400
        }
        this.ctx = this.canvas.getContext('2d')
        this.data = data
        this.colors = { young: '#4ecdc4', middle: '#ff9a9e', old: '#ffeaa7' }
        this.padding = { top: 40, right: 60, bottom: 80, left: 60 }
        this.hoveredBar = -1
        this.setupEventListeners()
        this.draw()
    }
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const barIndex = this.getBarIndex(x, y)
            if (barIndex !== this.hoveredBar) {
                this.hoveredBar = barIndex
                this.draw()
            }
        })
        this.canvas.addEventListener('mouseleave', () => {
            if (this.hoveredBar !== -1) {
                this.hoveredBar = -1
                this.draw()
            }
        })
    }
    getBarIndex(mouseX, mouseY) {
        const chartWidth = this.canvas.width - this.padding.left - this.padding.right
        const chartHeight = this.canvas.height - this.padding.top - this.padding.bottom
        const barWidth = (chartWidth / this.data.length) * 0.7
        const barSpacing = chartWidth / this.data.length
        for (let i = 0; i < this.data.length; i++) {
            const barX = this.padding.left + i * barSpacing + (barSpacing - barWidth) / 2
            const maxValue = Math.max(...this.data.map(d => d.young + d.middle + d.old))
            const totalValue = this.data[i].young + this.data[i].middle + this.data[i].old
            const barHeight = (totalValue / maxValue) * chartHeight
            const barY = this.padding.top + chartHeight - barHeight
            if (mouseX >= barX && mouseX <= barX + barWidth && mouseY >= barY && mouseY <= barY + barHeight) {
                return i
            }
        }
        return -1
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        const chartWidth = this.canvas.width - this.padding.left - this.padding.right
        const chartHeight = this.canvas.height - this.padding.top - this.padding.bottom
        const maxValue = Math.max(...this.data.map(d => d.young + d.middle + d.old))
        this.drawYAxis(maxValue, chartHeight)
        this.drawBars(chartWidth, chartHeight, maxValue)
        this.drawXAxis(chartWidth, chartHeight)
    }
    drawYAxis(maxValue, chartHeight) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        this.ctx.lineWidth = 1
        this.ctx.font = '14px system-ui, sans-serif'
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        this.ctx.textAlign = 'right'
        const steps = 5
        for (let i = 0; i <= steps; i++) {
            const value = (maxValue / steps) * i
            const y = this.padding.top + chartHeight - (i / steps) * chartHeight
            this.ctx.beginPath()
            this.ctx.moveTo(this.padding.left, y)
            this.ctx.lineTo(this.canvas.width - this.padding.right, y)
            this.ctx.stroke()
            this.ctx.fillText(Math.round(value), this.padding.left - 10, y + 4)
        }
    }
    drawBars(chartWidth, chartHeight, maxValue) {
        const barWidth = (chartWidth / this.data.length) * 0.7
        const barSpacing = chartWidth / this.data.length
        this.data.forEach((item, index) => {
            const barX = this.padding.left + index * barSpacing + (barSpacing - barWidth) / 2
            const totalValue = item.young + item.middle + item.old
            const barHeight = (totalValue / maxValue) * chartHeight
            const isHovered = this.hoveredBar === index
            const scale = isHovered ? 1.05 : 1
            const adjustedBarWidth = barWidth * scale
            const adjustedBarX = barX - (adjustedBarWidth - barWidth) / 2
            if (isHovered) {
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
                this.ctx.shadowBlur = 10
                this.ctx.shadowOffsetY = 5
            }
            let currentY = this.padding.top + chartHeight
            const oldHeight = (item.old / maxValue) * chartHeight * scale
            if (oldHeight > 0) {
                const gradient = this.ctx.createLinearGradient(0, currentY - oldHeight, 0, currentY)
                gradient.addColorStop(0, this.colors.old)
                gradient.addColorStop(1, this.adjustBrightness(this.colors.old, -20))
                this.ctx.fillStyle = gradient
                this.drawRoundedRect(adjustedBarX, currentY - oldHeight, adjustedBarWidth, oldHeight, 0, 0, 8, 8)
                currentY -= oldHeight
            }
            const middleHeight = (item.middle / maxValue) * chartHeight * scale
            if (middleHeight > 0) {
                const gradient = this.ctx.createLinearGradient(0, currentY - middleHeight, 0, currentY)
                gradient.addColorStop(0, this.colors.middle)
                gradient.addColorStop(1, this.adjustBrightness(this.colors.middle, -20))
                this.ctx.fillStyle = gradient
                this.ctx.fillRect(adjustedBarX, currentY - middleHeight, adjustedBarWidth, middleHeight)
                currentY -= middleHeight
            }
            const youngHeight = (item.young / maxValue) * chartHeight * scale
            if (youngHeight > 0) {
                const gradient = this.ctx.createLinearGradient(0, currentY - youngHeight, 0, currentY)
                gradient.addColorStop(0, this.colors.young)
                gradient.addColorStop(1, this.adjustBrightness(this.colors.young, -20))
                this.ctx.fillStyle = gradient
                this.drawRoundedRect(adjustedBarX, currentY - youngHeight, adjustedBarWidth, youngHeight, 8, 8, 0, 0)
            }
            this.ctx.shadowColor = 'transparent'
            this.ctx.shadowBlur = 0
            this.ctx.shadowOffsetY = 0
            if (isHovered) {
                this.drawTooltip(index, adjustedBarX + adjustedBarWidth / 2, this.padding.top + chartHeight - barHeight - 20)
            }
        })
    }
    drawRoundedRect(x, y, width, height, topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius) {
        this.ctx.beginPath()
        this.ctx.moveTo(x + topLeftRadius, y)
        this.ctx.lineTo(x + width - topRightRadius, y)
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + topRightRadius)
        this.ctx.lineTo(x + width, y + height - bottomRightRadius)
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRightRadius, y + height)
        this.ctx.lineTo(x + bottomLeftRadius, y + height)
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeftRadius)
        this.ctx.lineTo(x, y + topLeftRadius)
        this.ctx.quadraticCurveTo(x, y, x + topLeftRadius, y)
        this.ctx.closePath()
        this.ctx.fill()
    }
    drawTooltip(index, x, y) {
        const item = this.data[index]
        const total = item.young + item.middle + item.old
        const tooltipWidth = 120
        const tooltipHeight = 80
        const tooltipX = Math.min(Math.max(x - tooltipWidth / 2, 10), this.canvas.width - tooltipWidth - 10)
        const tooltipY = Math.max(y - tooltipHeight - 10, 10)
        this.ctx.fillStyle = 'white'
        this.ctx.beginPath()
        this.ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8)
        this.ctx.fill()
        this.ctx.fillStyle = 'black'
        this.ctx.font = 'bold 12px poppins, sans-serif'
        this.ctx.textAlign = 'left'
        this.ctx.fillText(item.month, tooltipX + 10, tooltipY + 15)
        this.ctx.font = '11px poppins, sans-serif'
        this.ctx.fillText(`Total: ${total}`, tooltipX + 10, tooltipY + 30)
        this.ctx.fillText(`< 20: ${item.young}`, tooltipX + 10, tooltipY + 45)
        this.ctx.fillText(`20-35: ${item.middle}`, tooltipX + 10, tooltipY + 60)
        this.ctx.fillText(`> 35: ${item.old}`, tooltipX + 10, tooltipY + 75)
    }
    drawXAxis(chartWidth, chartHeight) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        this.ctx.font = '14px system-ui, sans-serif'
        this.ctx.textAlign = 'center'
        const barSpacing = chartWidth / this.data.length
        this.data.forEach((item, index) => {
            const x = this.padding.left + index * barSpacing + barSpacing / 2
            const y = this.padding.top + chartHeight + 25
            this.ctx.fillText(item.month, x, y)
        })
    }
    adjustBrightness(color, amount) {
        const hex = color.replace('#', '')
        const num = parseInt(hex, 16)
        const r = Math.max(0, Math.min(255, (num >> 16) + amount))
        const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
        return `rgb(${r}, ${g}, ${b})`
    }
    updateData(newData) {
        this.data = newData
        this.draw()
    }
}

const yearlyData = {
    2020: [
        { month: 'Jan', young: 12, middle: 10, old: 5 },
        { month: 'Feb', young: 15, middle: 12, old: 6 },
        { month: 'Mar', young: 18, middle: 8, old: 4 },
        { month: 'Apr', young: 10, middle: 9, old: 7 },
        { month: 'Mei', young: 14, middle: 15, old: 6 },
        { month: 'Jun', young: 20, middle: 13, old: 8 },
        { month: 'Jul', young: 19, middle: 10, old: 5 },
        { month: 'Ags', young: 16, middle: 11, old: 7 },
        { month: 'Sep', young: 18, middle: 12, old: 9 },
        { month: 'Okt', young: 21, middle: 14, old: 8 },
        { month: 'Nov', young: 17, middle: 12, old: 5 },
        { month: 'Des', young: 15, middle: 10, old: 6 }
    ],
    2021: [
        { month: 'Jan', young: 14, middle: 12, old: 6 },
        { month: 'Feb', young: 13, middle: 11, old: 7 },
        { month: 'Mar', young: 16, middle: 9, old: 5 },
        { month: 'Apr', young: 15, middle: 10, old: 6 },
        { month: 'Mei', young: 19, middle: 14, old: 7 },
        { month: 'Jun', young: 22, middle: 15, old: 6 },
        { month: 'Jul', young: 20, middle: 12, old: 5 },
        { month: 'Ags', young: 18, middle: 11, old: 8 },
        { month: 'Sep', young: 21, middle: 13, old: 6 },
        { month: 'Okt', young: 20, middle: 15, old: 7 },
        { month: 'Nov', young: 16, middle: 14, old: 5 },
        { month: 'Des', young: 18, middle: 12, old: 7 }
    ],
    2022: [
        { month: 'Jan', young: 11, middle: 10, old: 4 },
        { month: 'Feb', young: 12, middle: 8, old: 5 },
        { month: 'Mar', young: 15, middle: 12, old: 6 },
        { month: 'Apr', young: 14, middle: 10, old: 7 },
        { month: 'Mei', young: 18, middle: 13, old: 6 },
        { month: 'Jun', young: 19, middle: 14, old: 5 },
        { month: 'Jul', young: 20, middle: 12, old: 6 },
        { month: 'Ags', young: 17, middle: 15, old: 7 },
        { month: 'Sep', young: 18, middle: 13, old: 5 },
        { month: 'Okt', young: 19, middle: 16, old: 6 },
        { month: 'Nov', young: 16, middle: 12, old: 4 },
        { month: 'Des', young: 15, middle: 11, old: 7 }
    ],
    2023: [
        { month: 'Jan', young: 13, middle: 12, old: 6 },
        { month: 'Feb', young: 14, middle: 9, old: 5 },
        { month: 'Mar', young: 18, middle: 10, old: 7 },
        { month: 'Apr', young: 16, middle: 12, old: 6 },
        { month: 'Mei', young: 19, middle: 14, old: 8 },
        { month: 'Jun', young: 21, middle: 15, old: 6 },
        { month: 'Jul', young: 20, middle: 13, old: 7 },
        { month: 'Ags', young: 18, middle: 12, old: 5 },
        { month: 'Sep', young: 22, middle: 14, old: 7 },
        { month: 'Okt', young: 21, middle: 13, old: 6 },
        { month: 'Nov', young: 19, middle: 15, old: 7 },
        { month: 'Des', young: 17, middle: 12, old: 5 }
    ],
    2024: [
        { month: 'Jan', young: 15, middle: 11, old: 5 },
        { month: 'Feb', young: 17, middle: 12, old: 6 },
        { month: 'Mar', young: 18, middle: 14, old: 7 },
        { month: 'Apr', young: 16, middle: 13, old: 5 },
        { month: 'Mei', young: 20, middle: 15, old: 8 },
        { month: 'Jun', young: 22, middle: 16, old: 7 },
        { month: 'Jul', young: 21, middle: 14, old: 6 },
        { month: 'Ags', young: 19, middle: 13, old: 8 },
        { month: 'Sep', young: 23, middle: 15, old: 7 },
        { month: 'Okt', young: 22, middle: 14, old: 6 },
        { month: 'Nov', young: 20, middle: 16, old: 8 },
        { month: 'Des', young: 18, middle: 13, old: 7 }
    ]
}

document.addEventListener('DOMContentLoaded', () => {
    const chart = new StackedBarChart('chartCanvas', yearlyData[2024])
    const yearDropdown = document.getElementById('yearDropdown')
    const yearList = document.getElementById('yearList')
    yearDropdown.addEventListener('click', () => {
        yearList.classList.toggle('hidden')
    })
    yearList.querySelectorAll('div[data-year]').forEach(item => {
        item.addEventListener('click', () => {
            const year = item.getAttribute('data-year')
            chart.updateData(yearlyData[year])
            yearList.classList.add('hidden')
        })
    })
});
// Statistic End

// Timeline Start
const video1 = "../assets/image/pic/timeline/video1.png";
const video2 = "../assets/image/pic/timeline/video2.png";
const video3 = "../assets/image/pic/timeline/video3.png";
const video4 = "../assets/image/pic/timeline/video4.png";
const video5 = "../assets/image/pic/timeline/video5.png";
const tag1 = "../assets/image/pic/timeline/tag1.png";
const tag2 = "../assets/image/pic/timeline/tag2.png";
const tag3 = "../assets/image/pic/timeline/tag3.png";
const tag4 = "../assets/image/pic/timeline/tag4.png";
const tag5 = "../assets/image/pic/timeline/tag5.png";
const circleTimeline = "../assets/image/pic/timeline/circle.png";
const chatLeft = "../assets/image/pic/timeline/chat-left.png";
const chatRight = "../assets/image/pic/timeline/chat-right.png";
const timelinePage = document.getElementById("timelinePage");

const timelineData = [
    {
        id: 1,
        name: "Pembuahan",
        title: "Momen Pembuahan",
        text: "Pada minggu pertama kehamilan, proses penting terjadi ketika sperma berhasil membuahi sel telur di dalam tuba falopi. Dari jutaan sperma yang masuk, hanya satu yang mampu menembus dinding sel telur. Pertemuan ini menghasilkan zigot, yaitu cikal bakal kehidupan baru. Zigot kemudian mulai mengalami pembelahan sel secara cepat, membentuk bola kecil berisi banyak sel.",
        video: "https://www.youtube.com/embed/s-Xpa5UZAZs?si=P-QYqr1DILIcPOyz",
        tag: tag1
    },
    {
        id: 2,
        name: "Trimester Pertama",
        title: "Detak Jantung Pertama",
        text: "Embrio berkembang pesat: tabung saraf membentuk otak dan sumsum tulang belakang, jantung mulai berdetak pada minggu ke-6, dan organ dasar seperti hati, ginjal, serta sistem peredaran darah mulai terbentuk. Di akhir trimester pertama, embrio resmi disebut janin. Gejala seperti mual, muntah, dan perubahan hormon umum dialami ibu.",
        video: "https://www.youtube.com/embed/EhUOkTPW7L0?si=8Hn8uHAJsSrnjzXU",
        tag: tag2
    },
    {
        id: 3,
        name: "Trimester Kedua",
        title: "Gerakan Janin Pertama",
        text: "Janin tumbuh lebih cepat, wajah semakin jelas, sidik jari terbentuk, dan gerakan aktif seperti menendang mulai terasa. Indera pendengaran bekerja, janin bisa merespons suara dari luar rahim. Pada fase ini, ibu biasanya merasa lebih bertenaga karena mual berkurang, meski tubuh mulai terlihat berubah signifikan.",
        video: "https://www.youtube.com/embed/DDb6mMIHtas?si=a66sQzhtcyo5xRqQ",
        tag: tag3
    },
    {
        id: 4,
        name: "Trimester Ketiga",
        title: "Janin berkembang sempurna",
        text: "Janin berkembang sempurna, berat badan bertambah dengan cepat, dan paru-paru matang. Janin biasanya sudah berada pada posisi kepala di bawah sebagai persiapan persalinan. Ibu bisa mengalami rasa tidak nyaman, seperti susah tidur atau sesak napas, karena janin semakin besar.",
        video: "https://www.youtube.com/embed/n7BSXMvo3O4?si=Sv_T6xxgojQmUWKq",
        tag: tag4
    },
    {
        id: 5,
        name: "Proses Persalinan",
        title: "Hari Kelahiran",
        text: "Ketika tubuh ibu siap melahirkan, kontraksi rahim dimulai. Proses ini melibatkan pembukaan serviks dan dorongan janin keluar melalui jalan lahir. Setelah bayi lahir, plasenta juga ikut keluar. Persalinan adalah puncak dari perjalanan kehamilan yang panjang dan penuh perubahan.",
        video: "https://www.youtube.com/embed/dzEPnx2XBEQ?si=yH5ICpVzYGv3Oi0i",
        tag: tag5
    },
];

timelineData.forEach((item, index) => {
    const bgUrl = index % 2
    ? "../assets/image/pic/timeline/chat-right.png"
    : "../assets/image/pic/timeline/chat-left.png";

    function isMobile() {
      return window.innerWidth <= 767;
    }

    timelinePage.innerHTML += `
        <div class="flex relative justify-center items-center ${index % 2 ? 'flex-row-reverse' : 'flex-row'}">
          ${isMobile() ? `
          <div class="lg:p-10 md:p-10 p-6 cursor-pointer hover:scale-105 duration-300 lg:relative md:absolute absolute lg:w-[500px] md:w-[500px] w-[320px] ${index % 2 ? 'fade-left' : 'fade-right'} h-[300px] flex flex-col justify-center bg-white rounded-lg border-1 border-[#6b6b6b] gap-2 lg:-mt-24 mt-0 lg:top-0 md:top-30 top-30">
            <h1 class="text-gradient font-semibold text-[22px] text-center">${item.title}</h1>
            <p class="text-gray font-regular text-[12px] text-center">${item.text}</p>
          </div>
          ` : `
          <div class="lg:p-10 md:p-10 p-6 cursor-pointer hover:scale-105 duration-300 lg:relative md:absolute absolute lg:w-[420px] md:w-[500px] w-[320px] ${index % 2 ? 'fade-left' : 'fade-right'} h-[300px] object-cover bg-no-repeat bg-contain bg-center flex flex-col justify-center gap-2 lg:-mt-24 mt-0 lg:top-0 md:top-30 top-30" style="background-image: url('${bgUrl}')">
            <h1 class="text-gradient font-semibold text-[22px] ${index % 2 ? 'text-right' : 'text-left'}">${item.title}</h1>
            <p class="text-gray font-regular text-[12px] ${index % 2 ? 'text-right' : 'text-left'}">${item.text}</p>
          </div>
          `}
          <div class="flex flex-col justify-center items-center gap-4">
            <p class="text-white bg-primary p-4 rounded-lg font-semibold text-[20px] w-60 text-center">${item.name}</p>
            <div class="w-1 h-28 bg-primary rounded-lg"></div>
            <img src="${circleTimeline}" class="w-[40px] h-auto" alt="">
            <div class="w-1 lg:h-100 md:h-160 h-140 bg-primary rounded-lg"></div>
          </div>
          <div class="flex flex-col lg:relative md:absolute absolute lg:w-auto md:w-[500px] w-[320px] gap-6 lg:mt-30 mt-0 lg:top-0 md:top-110 top-120 ${index % 2 ? 'fade-right' : 'fade-left'}">
            <img src="${item.tag}" class="w-[160px] h-auto ${index % 2 ? 'ml-auto' : 'mr-auto'}" alt="">                        
            <div class="w-full lg:w-[420px] md:w-[500px] aspect-video">
              <iframe
                class="w-full h-full rounded-lg"
                src="${item.video}"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
    `;
});
// Timeline End

// Tips Start
const tipsImage1 = '../assets/image/pic/tips/image1.png';
const tipsImage2 = '../assets/image/pic/tips/image2.png';
const tipsImage3 = '../assets/image/pic/tips/image3.png';
const tipsImage4 = '../assets/image/pic/tips/image4.png';
const tipsImage5 = '../assets/image/pic/tips/image5.png';
const tipsImage6 = '../assets/image/pic/tips/image6.png';
const tipsPage = document.getElementById("tipsPage");

const tipsData = [
    {
        id: 1,
        image: tipsImage1,
        title: "Cukupi Kebutuhan Tidur",
        desc: "Tidur yang cukup (7–9 jam) membantu tubuh ibu hamil memulihkan energi dan mendukung perkembangan janin. Hindari begadang agar kesehatan tetap terjaga.",
        width: 140,
    },
    {
        id: 2,
        image: tipsImage2,
        title: "Konsumsi Makanan Bergizi",
        desc: "Pilih makanan kaya asam folat, zat besi, Dan Kalsium. Contohnya sayuran hijau, susu, telur, ikan matang, serta buah segar untuk mendukung tumbuh kembang janin.",
        width: 140,
    },
    {
        id: 3,
        image: tipsImage3,
        title: "Rutin Kontrol Kehamilan",
        desc: "Lakukan pemeriksaan ke dokter kandungan atau bidan sesuai jadwal, biasanya setiap bulan, untuk memantau kondisi ibu dan perkembangan janin.",
        width: 180,
    },
    {
        id: 4,
        image: tipsImage4,
        title: "Aktif dengan Olahraga Ringan",
        desc: "Aktivitas fisik seperti jalan santai, yoga hamil, atau senam ringan membantu melancarkan peredaran darah, mengurangi nyeri, dan mempersiapkan persalinan.",
        width: 180,
    },
    {
        id: 5,
        image: tipsImage5,
        title: "Kelola Stres dengan Baik",
        desc: "Hindari stres berlebihan karena dapat memengaruhi kesehatan ibu dan janin. Lakukan relaksasi, pernapasan dalam, atau kegiatan yang membuat tenang.",
        width: 120,
    },
    {
        id: 6,
        image: tipsImage6,
        title: "Hindari Kebiasaan Yang Berisiko",
        desc: "Jauhi rokok, alkohol, kafein berlebihan, serta makanan mentah atau setengah matang untuk mencegah risiko infeksi dan komplikasi.",
        width: 120,
    },
];

tipsData.forEach((item, index) => {
    tipsPage.innerHTML += `
        <div class="flex flex-col bg-[#631B99] p-6 rounded-lg lg:w-[540px] w-full lg:min-h-[240px] md:h-[200px] min-h-[240px] h-auto hover:scale-105 duration-300 cursor-pointer">
          <div class="flex items-center gap-4">
            <p class="font-semibold text-white bg-[#6B00FF] px-4 py-2 rounded-full lg:text-[16px] md:text-[16px] text-[14px]">${item.id}</p>
            <h1 class="font-semibold text-black lg:text-[22px] md:text-[22px] text-[16px] text-white">${item.title}</h1>
          </div>
          <div class="flex lg:flex-row md:flex-row flex-col-reverse items-center lg:gap-4 md:gap-4 gap-8 lg:mt-0 md:mt-0 mt-8">
            <p class="text-white font-regular lg:text-[14px] md:text-[14px] text-[12px]">${item.desc}</p>
            <img src="${item.image}" class="w-[${item.width}px] h-auto" alt="">
          </div>
        </div>
    `;
});
// Tips End

// Testimoni Start
import { testimoniData1, testimoniData2 } from "./data/testimoni.js";
const stars = '../assets/image/pic/testimoni/stars.png';
const comment = '../assets/image/pic/testimoni/comment.png';
const wrapper1 = document.getElementById('scrollWrapper1');
const testimoniPage1 = document.getElementById('testimoniId1');
const wrapper2 = document.getElementById('scrollWrapper2');
const testimoniPage2 = document.getElementById('testimoniId2');
let testimoniPage1Html = '';
let testimoniPage2Html = '';
let scrollSpeed = 1;

testimoniData1.forEach((data) => {
    testimoniPage1Html += `
        <div class="flex flex-col gap-6 rounded-lg p-6  w-[400px] border-primary">
            <div class="flex justify-between items-center">
              <div class="flex justify-center items-center gap-4">
                <img src="${data.image}" class="w-[70px] h-auto rounded-full" alt="">
                <div class="flex flex-col gap-2">
                  <h1 class="text-black font-semibold text-[20px]">${data.name}</h1>
                  <img src="${stars}" class="w-[100px] h-auto" alt="">
                </div>
              </div>
              <img src="${comment}" class="w-[40px] h-auto" alt="">
            </div>
            <div class="w-full">
              <p class="font-medium text-gray text-[14px] text-justify">${data.text}</p>
            </div>
        </div>
    `
});

testimoniPage1.innerHTML = testimoniPage1Html;
wrapper1.addEventListener('scroll', () => {
  const maxScroll = testimoniPage1.scrollWidth - wrapper1.clientWidth;
  
  if (wrapper1.scrollLeft >= maxScroll - 100) { 
    testimoniPage1.innerHTML += testimoniPage1Html;
  }
});

testimoniData2.forEach((data) => {
    testimoniPage2Html += `
        <div class="flex flex-col gap-6 rounded-lg p-6  w-[400px] border-primary">
            <div class="flex justify-between items-center">
              <div class="flex justify-center items-center gap-4">
                <img src="${data.image}" class="w-[70px] h-auto rounded-full" alt="">
                <div class="flex flex-col gap-2">
                  <h1 class="text-black font-semibold text-[20px]">${data.name}</h1>
                  <img src="${stars}" class="w-[100px] h-auto" alt="">
                </div>
              </div>
              <img src="${comment}" class="w-[40px] h-auto" alt="">
            </div>
            <div class="w-full">
              <p class="font-medium text-gray text-[14px] text-justify">${data.text}</p>
            </div>
        </div>
    `
});

testimoniPage2.innerHTML += testimoniPage2Html;
wrapper2.scrollLeft = testimoniPage2.scrollWidth / 2;

function autoScroll() {
    wrapper1.scrollLeft += scrollSpeed;
    wrapper2.scrollLeft -= scrollSpeed;

    if (wrapper1.scrollLeft >= testimoniPage1.scrollWidth / 2) {
        wrapper1.scrollLeft = 0;
    }

    if (wrapper2.scrollLeft <= 0) {
        wrapper2.scrollLeft = testimoniPage2.scrollWidth / 2;
    }

    requestAnimationFrame(autoScroll);
}

autoScroll();
// Testimoni End

// Animation Detect Start
const elements = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, {
  rootMargin: "0px 0px -100px 0px"
});

elements.forEach(el => observer.observe(el));
// Animation Detect End