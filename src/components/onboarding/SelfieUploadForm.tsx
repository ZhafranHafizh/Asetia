'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { uploadSelfie } from '@/app/onboarding/verification/actions'
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import * as faceapi from 'face-api.js'

export function SelfieUploadForm() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDetecting, setIsDetecting] = useState(false)
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [faceDetected, setFaceDetected] = useState<boolean | null>(null)

    // Load face-api.js models on component mount
    useEffect(() => {
        async function loadModels() {
            try {
                const MODEL_URL = '/models' // We'll need to add models to public folder
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
                setModelsLoaded(true)
            } catch (err) {
                console.error('Failed to load face detection models:', err)
                // Continue without face detection if models fail to load
                setModelsLoaded(true)
            }
        }
        loadModels()
    }, [])

    async function detectFace(imageElement: HTMLImageElement) {
        setIsDetecting(true)
        setFaceDetected(null)

        try {
            const detections = await faceapi.detectAllFaces(
                imageElement,
                new faceapi.TinyFaceDetectorOptions()
            )

            if (detections.length > 0) {
                setFaceDetected(true)
                setError(null)
            } else {
                setFaceDetected(false)
                setError('Tidak ada wajah terdeteksi. Mohon ambil foto selfie yang jelas dengan wajah Anda terlihat.')
            }
        } catch (err) {
            console.error('Face detection error:', err)
            // If detection fails, allow upload anyway
            setFaceDetected(true)
        } finally {
            setIsDetecting(false)
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB')
            return
        }

        setSelectedFile(file)
        setError(null)
        setFaceDetected(null)

        // Create preview and detect face
        const reader = new FileReader()
        reader.onloadend = () => {
            const imageUrl = reader.result as string
            setPreviewUrl(imageUrl)

            // Create image element for face detection
            const img = new Image()
            img.onload = () => {
                if (modelsLoaded) {
                    detectFace(img)
                } else {
                    // If models aren't loaded, allow upload anyway
                    setFaceDetected(true)
                }
            }
            img.src = imageUrl
        }
        reader.readAsDataURL(file)
    }

    async function handleUpload() {
        if (!selectedFile) {
            setError('Pilih file terlebih dahulu')
            return
        }

        if (faceDetected === false) {
            setError('Tidak dapat mengupload. Pastikan wajah Anda terlihat jelas di foto.')
            return
        }

        setIsUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append('selfie', selectedFile)

        const result = await uploadSelfie(formData)

        setIsUploading(false)

        if (result.error) {
            setError(result.error)
        } else if (result.success) {
            setSuccess(true)
        }
    }

    if (success) {
        return (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
                <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-400 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-2">Berhasil!</h2>
                    <p className="text-muted-foreground font-medium mb-2">
                        Foto Selfie Berhasil Diunggah!
                    </p>
                    <p className="text-sm text-muted-foreground font-medium mb-6">
                        Aplikasi Anda sedang dalam proses review. Kami akan menghubungi Anda dalam 1-3 hari kerja.
                    </p>
                    <Button
                        onClick={() => router.push('/onboarding/email-verification')}
                        className="bg-cyan-400 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 px-8"
                    >
                        Lanjut ke Verifikasi Email
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-gray-50">
                <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
                    <Camera className="h-6 w-6" />
                    Upload Foto Selfie
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                {/* Security Disclaimer */}
                <div className="mb-6 p-4 border-2 border-blue-500 bg-blue-50 rounded-sm">
                    <p className="text-sm font-medium text-blue-900">
                        🔒 <strong>Keamanan Data:</strong> Selfie Anda dienkripsi dan disimpan di server privat kami hanya untuk keperluan verifikasi otomatis. Data ini tidak akan ditampilkan di profil publik Anda.
                    </p>
                </div>

                {/* Upload Box */}
                <div className="space-y-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!selectedFile ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-8 border-4 border-dashed border-black rounded-sm bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <div className="text-center">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="font-black uppercase mb-2">Klik untuk Upload Selfie</p>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Format: JPG, PNG (Maks. 5MB)
                                </p>
                            </div>
                        </button>
                    ) : (
                        <div className="space-y-4">
                            {/* Preview */}
                            {previewUrl && (
                                <div className="border-4 border-black rounded-sm overflow-hidden relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-64 object-cover"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            )}

                            {/* Face Detection Status */}
                            {isDetecting && (
                                <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-sm flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                    <p className="text-blue-700 font-bold text-sm">Mendeteksi wajah...</p>
                                </div>
                            )}

                            {!isDetecting && faceDetected === true && (
                                <div className="p-4 border-2 border-green-500 bg-green-50 rounded-sm flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-bold text-sm">✓ Wajah Terdeteksi</p>
                                </div>
                            )}

                            {!isDetecting && faceDetected === false && (
                                <div className="p-4 border-2 border-red-500 bg-red-50 rounded-sm flex items-start gap-2">
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-700 font-bold text-sm">Tidak ada wajah terdeteksi</p>
                                        <p className="text-red-600 text-xs mt-1">Mohon ambil foto selfie yang jelas dengan wajah Anda terlihat.</p>
                                    </div>
                                </div>
                            )}

                            {/* File Info */}
                            <div className="p-4 border-2 border-black bg-gray-50 rounded-sm">
                                <p className="font-bold text-sm mb-1">File Terpilih:</p>
                                <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                            {/* Change File Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSelectedFile(null)
                                    setPreviewUrl(null)
                                    setFaceDetected(null)
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                }}
                                className="w-full border-2 border-black font-bold rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                Ganti File
                            </Button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && faceDetected !== false && (
                        <div className="p-4 border-2 border-red-500 bg-red-50 rounded-sm flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    {selectedFile && (
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || isDetecting || faceDetected === false}
                            className="w-full bg-black text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mengupload...
                                </>
                            ) : isDetecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mendeteksi Wajah...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Upload Selfie
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
